import bcrypt from 'bcrypt';
import Knex from 'knex';
import { DateTime } from 'luxon';
import { Service } from 'typedi';
import { env } from '../../config';
import { API, Auth, Roles, Users, Validations } from '../../interfaces';
import { ResetModel, UserModel, ValidationModel } from '../../models';
import { HTTPError } from '../../utils';
import BaseService from '../baseService';
import { MailService } from '../mail';
import {
  generateResetCode,
  generateToken,
  generateValidationURL,
} from './helpers';

@Service()
export default class AuthService extends BaseService {
  constructor(
    private userModel: UserModel,
    private resetModel: ResetModel,
    private validationModel: ValidationModel,
    private mailer: MailService
  ) {
    super();
  }

  public async register(body: Users.INewUser): Promise<Auth.IAuthResponse> {
    try {
      // Check body data one more time for safety since we explicitly cast later
      if (!body.dob) throw HTTPError.create(400, 'No DOB received');
      const dob =
        typeof body.dob === 'string'
          ? DateTime.fromISO(body.dob)
          : DateTime.fromJSDate(body.dob);
      const now = DateTime.utc();
      const { years } = now.diff(dob, 'years').toObject();
      const age = years ?? 0;
      // Initialize variable to store sendTo email for validation
      let sendTo: string;
      let isParent = false;
      if (!body.email) throw HTTPError.create(400, 'No email received');
      if (!body.password) throw HTTPError.create(400, 'No password received');
      if (!body.codename) throw HTTPError.create(400, 'No codename received');
      // Underage users must have a parent email on file for validation
      if (age < 13) {
        if (!body.parentEmail || body.email === body.parentEmail) {
          throw HTTPError.create(
            400,
            'Underage users must have a parent email on file'
          );
        } else {
          sendTo = body.parentEmail;
          isParent = true;
        }
      } else {
        sendTo = body.email;
      }
      let response: Auth.IAuthResponse | undefined;
      // Start a transaction for data integrity
      await this.db.transaction(async (trx) => {
        // Further sanitize data
        Reflect.deleteProperty(body, 'parentEmail');
        // Create a new user object
        const hashedPassword = await this.hashPassword(body.password);
        const [user] = await this.userModel.add(
          {
            ...body,
            password: hashedPassword,
            roleId: Roles.RoleEnum['user'],
          },
          { knex: trx }
        );
        // send validation email
        await this.sendValidationEmail(
          {
            sendTo,
            isParent,
            user,
          },
          { knex: trx }
        );
        // Remove password hash from response body
        Reflect.deleteProperty(user, 'password');
        const token = generateToken(user);
        response = { user, token };
        this.logger.debug(`User (ID: ${user.id}) successfully registered`);
      });
      // TODO figure out if and when this happens and assign a better error
      if (response === undefined) throw HTTPError.create(500);
      return response;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async signIn(
    codename: string,
    password: string
  ): Promise<Auth.IAuthResponse> {
    try {
      const user = await this.userModel.get({ codename }, { first: true });
      if (!user) throw HTTPError.create(404, 'User not found');
      this.logger.debug(`Verifying password for user (CODENAME: ${codename})`);
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) throw HTTPError.create(401, 'Incorrect password');
      this.logger.debug(`Password verified`);
      // Remove password hash from response body
      Reflect.deleteProperty(user, 'password');
      const token = generateToken(user);
      return { user, token };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async validate(
    email: string,
    token: string
  ): Promise<Auth.IAuthResponse> {
    try {
      // Attempt to validate the user
      const userValidation = await this.userModel.getUserByValidationEmail(
        email
      );
      if (!userValidation) throw HTTPError.create(404, 'User not found');
      if (userValidation.isValidated) {
        throw HTTPError.create(409, 'User has already been validated');
      }
      if (token !== userValidation.code) {
        throw HTTPError.create(401, 'Invalid activation code');
      }
      let updatedUser: Users.IUser | undefined;
      await this.db.transaction(async () => {
        const now = DateTime.utc().toISO();
        updatedUser = await this.userModel.update(userValidation.id, {
          isValidated: true,
          updated_at: (now as unknown) as Date,
        });
        await this.validationModel.update(userValidation.validationId, {
          completed_at: (now as unknown) as Date,
        });
      });
      if (!updatedUser) throw HTTPError.create(409, 'Could not create user');
      // Remove password hash from response body
      Reflect.deleteProperty(updatedUser, 'password');
      // Generate a JWT for the user to login
      const jwt = generateToken(updatedUser);
      this.logger.debug(
        `User (ID: ${userValidation.id}) successfully validated and authenticated`
      );
      return {
        user: updatedUser,
        token: jwt,
      };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
  public async newValidationEmail(
    data: API.WithAuth<Validations.IGetNewValidationBody>
  ): Promise<void> {
    try {
      let sendTo: string;
      let isParent = false;
      console.log(data.__user);
      // IF you don't send an age, then it will read the age from your user on the body
      const age =
        data.age ||
        DateTime.fromFormat(data.__user.dob, 'yyyy-MM-dd').diffNow('years')
          .years;

      if (!age) throw HTTPError.create(400, 'No age received');
      if (age < 13) {
        if (data.newEmail === data.__user.email) {
          throw HTTPError.create(
            400,
            'Underage users must send to parent email'
          );
        } else {
          sendTo = data.newEmail;
          isParent = true;
        }
      } else {
        if (!data.newEmail) {
          throw HTTPError.create(400, 'No email received');
        } else {
          sendTo = data.newEmail;
        }
      }
      // checks time since last email sent
      const validation = await this.validationModel.getRecentByUserId(
        data.__user.id
      );

      await this.db.transaction(async (trx) => {
        if (validation) {
          if (!this.canSendNewEmail(validation)) {
            // Too soon to send another email, user is still in the lockout window
            throw HTTPError.create(429, 'Cannot send another email so soon');
          } else {
            // Able to generate another code, so delete the old one
            await this.resetModel.update(validation.id, {
              completed: true,
              knex: trx,
            });
          }
        }
        // send validation email
        await this.sendValidationEmail({
          sendTo,
          isParent,
          user: data.__user,
        });
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
  public async resendValidationEmail(user: Users.IUser): Promise<void> {
    try {
      // Get our validation
      const validation = await this.validationModel.getRecentByUserId(user.id);

      // Handle our error cases
      if (!validation) throw HTTPError.create(404, 'No validation found');
      if (!this.canSendNewEmail(validation))
        // Too soon to send another email, user is still in th lockout window
        throw HTTPError.create(429, 'Cannot send another email so soon');

      // Otherwise, send the new email
      await this.sendValidationEmail({
        sendTo: validation.email,
        isParent: validation.validatorId === Validations.ValidatorEnum.parent,
        user,
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
  public async getResetEmail(email: string) {
    try {
      const user = await this.userModel.get({ email }, { first: true });
      if (!user) throw HTTPError.create(404, 'Email not found');
      const resetItem = await this.resetModel.get(
        { userId: user.id },
        { first: true, orderBy: 'created_at', order: 'DESC' }
      );
      await this.db.transaction(async () => {
        if (resetItem) {
          if (!this.canSendNewEmail(resetItem)) {
            throw HTTPError.create(429, 'Cannot send another email so soon');
          } else {
            // Able to generate another code, so delete the old one
            await this.resetModel.update(resetItem.id, { completed: true });
          }
        }
        const code = generateResetCode(user);
        await this.resetModel.add({ code, userId: user.id });
        await this.mailer.sendPasswordResetEmail(user, code);
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
  public async resetPasswordWithCode(
    email: string,
    password: string,
    token: string
  ) {
    try {
      const user = await this.userModel.get({ email }, { first: true });
      if (!user) throw HTTPError.create(404, 'Email not found');
      const resetItem = await this.resetModel.get(
        { userId: user.id },
        { first: true }
      );
      if (!resetItem)
        throw HTTPError.create(409, 'No password resets are active');
      if (resetItem.code !== token)
        throw HTTPError.create(401, 'Invalid password reset code');
      this.logger.debug(
        `Password reset code verified for user (ID: ${user.id})`
      );
      const hashedPassword = await this.hashPassword(password);
      await this.db.transaction(async () => {
        await this.userModel.update(user.id, {
          password: hashedPassword,
          updated_at: (DateTime.utc().toISO() as unknown) as Date,
        });
        await this.resetModel.update(resetItem.id, { completed: true });
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  private async sendValidationEmail(
    args: {
      sendTo: string;
      isParent: boolean;
      user: Users.ICleanUser | Users.IUser;
    },
    options?: { knex: Knex }
  ) {
    // Generate Validation for user
    const { url, code } = generateValidationURL(
      args.user.codename,
      args.sendTo
    );
    await this.validationModel.add(
      {
        code,
        userId: args.user.id,
        email: args.sendTo,
        validatorId: args.isParent
          ? Validations.ValidatorEnum.parent
          : Validations.ValidatorEnum.user,
      },
      { knex: options?.knex }
    );
    if (!args.isParent) {
      await this.mailer.sendValidationEmail(args.sendTo, url);
    } else {
      await this.mailer.sendParentValidationEmail(
        args.sendTo,
        url,
        args.user.firstname
      );
    }
  }
  public async hashPassword(password: string) {
    this.logger.debug('Hashing password');
    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);
    this.logger.debug('Password hashed');
    return hashedPassword;
  }
  public generateToken = generateToken;

  // Use this to consistently restrict the sending of multiple emails too rapidly
  public canSendNewEmail(email?: Validations.IValidation | Auth.resets.IReset) {
    // Set lockout based on whether the field is validator or reset (in minutes, 10 if unset)
    let lockout = 10;
    if ((email as Validations.IValidation)?.validatorId) {
      lockout = env.VALIDATION_EMAIL_LOCKOUT;
    } else {
      lockout = env.RESET_EMAIL_LOCKOUT;
    }
    const createdAt =
      email?.created_at.getTime() ||
      DateTime.now()
        // Fall back to a time that allows them to get an email, 20 minutes past the lockout window
        .minus({ minutes: lockout + 20 })
        .toMillis();
    const timeSinceLastRequest = Date.now() - createdAt;
    const lockoutInMS = lockout * 60 * 1000;
    return timeSinceLastRequest >= lockoutInMS;
  }
}
