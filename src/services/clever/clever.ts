import { Service } from 'typedi';
import { Auth, Clever, Enum, Roles, SSOLookups, Users } from '../../interfaces';
import { SSOLookupModel, UserModel } from '../../models';
import { HTTPError } from '../../utils';
import { AuthService } from '../auth';
import BaseService from '../baseService';
import { RumbleService } from '../rumble';
import CleverClient from './client';

@Service()
export default class CleverService extends BaseService {
  constructor(
    private clever: CleverClient,
    private userModel: UserModel,
    private rumbleService: RumbleService,
    private authService: AuthService,
    private ssoModel: SSOLookupModel
  ) {
    super();
  }

  public getLoginButtonURI() {
    const buttonURI = this.clever.getLoginButtonURI();
    return buttonURI;
  }

  public async authorizeUser(code: string): Promise<Clever.auth.IResponse> {
    try {
      // Exchange user's code for a token
      const { access_token: token } = await this.clever.getToken(code);
      // Get user's info from clever
      const rawUser = await this.clever.getUserInfo(token);
      let roleId: number;
      if (rawUser.type === 'student') roleId = Roles.RoleEnum.user;
      else if (rawUser.type === 'teacher') roleId = Roles.RoleEnum.teacher;
      else throw HTTPError.create(401, 'Account type not supported');
      // Now we have user info, check if they exist in our database
      const existingUser = await this.userModel.findByCleverId(rawUser.data.id);
      if (existingUser) {
        // If the user exists in our DB, sign them in! Easy!
        const authToken = this.authService.generateToken(existingUser);
        Reflect.deleteProperty(existingUser, 'password');
        // Return an auth response and user type!
        return {
          actionType: 'SUCCESS',
          body: { token: authToken, user: existingUser },
          cleverId: rawUser.data.id,
          roleId,
        };
      } else {
        // We don't have a user account connected to their clever ID yet!
        const { data: user } = await this.clever.getUserProfile(rawUser, token);
        // If the user has an email in their clever account, check our
        // user table for an email match. If we find a match, the user
        // needs to merge their existing account!
        if (user.email) {
          // Check for email match
          const userToMerge = await this.userModel.get(
            { email: user.email },
            { first: true }
          );
          if (userToMerge) {
            // If we found a mergable user, return a merge response!!
            return {
              actionType: 'MERGE',
              body: userToMerge,
              cleverId: rawUser.data.id,
              roleId,
            };
          }
        }
        // If all of the above preconditions fail, we know the use does
        // not have an account with us, and as such we must pass their
        // clever info and user type to the frontend to allow them to
        // create a new account in our database. The reason we pass the
        // clever user data is to restrict onboarding friction by making
        // it as easy as possible for our users.
        return {
          actionType: 'NEW',
          body: user,
          cleverId: rawUser.data.id,
          roleId,
        };
      }
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async registerCleverUser(
    body: Users.IOAuthUser,
    userType: string,
    cleverId: string
  ): Promise<Auth.IAuthResponse> {
    try {
      this.logger.debug(
        `Attempting to register user with codename ${body.codename}`
      );
      // Figure out the user's role
      let roleId: number;
      if (userType === 'student') roleId = Roles.RoleEnum.user;
      else if (userType === 'teacher') roleId = Roles.RoleEnum.teacher;
      else throw HTTPError.create(400, 'Invalid user type');
      // Initialize variables for return values
      let user, token;
      // Attempt to create a user and log them in
      await this.db.transaction(async () => {
        // Sanitize data
        Reflect.deleteProperty(body, 'age');
        Reflect.deleteProperty(body, 'parentEmail');
        // Hash their password
        const hashedPassword = await this.authService.hashPassword(
          body.password
        );
        // Add the user to the database
        user = await this.userModel.add(
          {
            ...body,
            password: hashedPassword,
            isValidated: true,
            roleId,
          },
          true
        );
        await this.ssoModel.add({
          accessToken: cleverId,
          providerId: SSOLookups.LookupEnum.Clever,
          userId: user.id,
        });
        // Generate their auth token
        token = this.authService.generateToken(user);
      });
      // Verify the user was created and logged in successfully
      if (!user || !token) throw HTTPError.create(401, 'Failed to create user');
      else return { user, token };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async loginAndMerge(
    codename: string,
    password: string,
    cleverId: string
  ): Promise<Auth.IAuthResponse> {
    try {
      const { token, user } = await this.authService.signIn(codename, password);
      await this.ssoModel.add({
        accessToken: cleverId,
        providerId: SSOLookups.LookupEnum.Clever,
        userId: user.id,
      });
      return { token, user };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getUserInfo(user: Users.IUser) {
    try {
      const enumData = await this.getEnumData();
      const sections = await this.rumbleService.getSections(user);
      return {
        enumData,
        sections: sections,
      };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  private async getEnumData(): Promise<Enum.IEnumData> {
    function getEnumData__innerMap(
      item: Record<string, string>
    ): Enum.ISelectOption {
      const itemId = Object.keys(item).filter((i) => i !== 'id')[0];
      return { value: item.id, label: item[itemId] };
    }
    try {
      // Get and parse the database results for grade enums
      const gradeList = await this.db('enum_grades');
      const grades = gradeList.map(getEnumData__innerMap);

      // and for subject enums
      const subjectList = await this.db('enum_subjects');
      const subjects = subjectList.map(getEnumData__innerMap);

      return { grades, subjects };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
