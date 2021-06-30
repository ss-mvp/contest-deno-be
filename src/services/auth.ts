import { Service } from 'typedi';
import BaseService from './baseService';

@Service()
export default class AuthService extends BaseService {
  // constructor(
  //   @Inject(UserModel) private userModel: UserModel,
  //   @Inject(ResetModel) private resetModel: ResetModel,
  //   @Inject(ValidationModel) private validationModel: ValidationModel,
  //   @Inject(MailService) private mailer: MailService
  // ) {
  //   super();
  // }
  // public async register(body: Users.INewUser): Promise<Auth.IAuthResponse> {
  //   try {
  //     // Check body data one more time for safety since we explicitly cast later
  //     if (!body.dob) throw HTTPError.create(400, 'No DOB received');
  //     const dob =
  //       typeof body.dob === 'string'
  //         ? DateTime.fromISO(body.dob)
  //         : DateTime.fromJSDate(body.dob);
  //     const now = DateTime.utc();
  //     const { years } = now.diff(dob, 'years').toObject();
  //     const age = years ?? 0;
  //     // Initialize variable to store sendTo email for validation
  //     let sendTo: string;
  //     let isParent = false;
  //     if (!body.email) throw HTTPError.create(400, 'No email received');
  //     if (!body.password) throw HTTPError.create(400, 'No password received');
  //     if (!body.codename) throw HTTPError.create(400, 'No codename received');
  //     // Underage users must have a parent email on file for validation
  //     if (age < 13) {
  //       if (!body.parentEmail || body.email === body.parentEmail) {
  //         throw HTTPError.create(
  //           400,
  //           'Underage users must have a parent email on file'
  //         );
  //       } else {
  //         sendTo = body.parentEmail;
  //         isParent = true;
  //       }
  //     } else {
  //       sendTo = body.email;
  //     }
  //     let response: Auth.IAuthResponse | undefined;
  //     // Start a transaction for data integrity
  //     await this.db.transaction(async () => {
  //       // Further sanitize data
  //       Reflect.deleteProperty(body, 'parentEmail');
  //       // Create a new user object
  //       const hashedPassword = await this.hashPassword(body.password);
  //       const [user] = await this.userModel.add({
  //         ...body,
  //         password: hashedPassword,
  //         roleId: Roles.RoleEnum['user'],
  //       });
  //       // send validation email
  //       this.SendValidationEmail({
  //         sendTo,
  //         isParent,
  //         user,
  //       });
  //       // Remove password hash from response body
  //       Reflect.deleteProperty(user, 'password');
  //       const token = await this.generateToken(user);
  //       response = { user, token };
  //       this.logger.debug(`User (ID: ${user.id}) successfully registered`);
  //     });
  //     if (response === undefined) throw HTTPError.create(500);
  //     return response;
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw err;
  //   }
  // }
  // public async SignIn(
  //   codename: string,
  //   password: string
  // ): Promise<Auth.IAuthResponse> {
  //   try {
  //     const user = await this.userModel.get({ codename }, { first: true });
  //     if (!user) throw HTTPError.create(404, 'User not found');
  //     this.logger.debug(`Verifying password for user (CODENAME: ${codename})`);
  //     const validPassword = await bcrypt.compare(password, user.password);
  //     if (!validPassword) throw HTTPError.create(401, 'Invalid password');
  //     this.logger.debug(`Password verified`);
  //     // Remove password hash from response body
  //     Reflect.deleteProperty(user, 'password');
  //     const token = await this.generateToken(user);
  //     return { user, token };
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw err;
  //   }
  // }
  // public async Validate(
  //   email: string,
  //   token: string
  // ): Promise<Auth.IAuthResponse> {
  //   try {
  //     // Attempt to validate the user
  //     const userValidation = await this.userModel.getUserByResetEmail(email);
  //     if (!userValidation) throw HTTPError.create(404, 'User not found');
  //     if (userValidation.isValidated) {
  //       throw HTTPError.create(409, 'User has already been validated');
  //     }
  //     if (token !== userValidation.code) {
  //       throw HTTPError.create(401, 'Invalid activation code');
  //     }
  //     let updatedUser: Users.IUser | undefined;
  //     await this.db.transaction(async () => {
  //       const now = DateTime.utc().toISO();
  //       updatedUser = await this.userModel.update(userValidation.id, {
  //         isValidated: true,
  //         updated_at: (now as unknown) as Date,
  //       });
  //       await this.validationModel.update(userValidation.validationId, {
  //         completed_at: (now as unknown) as Date,
  //       });
  //     });
  //     if (!updatedUser) throw HTTPError.create(409, 'Could not create user');
  //     // Remove password hash from response body
  //     Reflect.deleteProperty(updatedUser, 'password');
  //     // Generate a JWT for the user to login
  //     const jwt = await this.generateToken(updatedUser);
  //     this.logger.debug(
  //       `User (ID: ${userValidation.id}) successfully validated and authenticated`
  //     );
  //     return {
  //       user: updatedUser,
  //       token: jwt,
  //     };
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw err;
  //   }
  // }
  // public async SendNewValidationEmail(
  //   data: Validations.IGetNewValidationBody
  // ): Promise<void> {
  //   try {
  //     let sendTo: string;
  //     let isParent = false;
  //     if (!data.age) throw HTTPError.create(400, 'No age received');
  //     if (data.age < 13) {
  //       if (data.newEmail === data.user.email) {
  //         throw HTTPError.create(
  //           400,
  //           'Underage users must send to parent email'
  //         );
  //       } else {
  //         sendTo = data.newEmail;
  //         isParent = true;
  //       }
  //     } else {
  //       if (!data.newEmail) {
  //         throw HTTPError.create(400, 'No email received');
  //       } else {
  //         sendTo = data.newEmail;
  //       }
  //     }
  //     // checks time since last email sent
  //     const validation = await this.validationModel.getRecentByUserId(
  //       data.user.id
  //     );
  //     if (!validation) throw HTTPError.create(404, 'No validation found');
  //     const timeSinceLastRequest = Date.now() - validation.created_at.getTime();
  //     if (timeSinceLastRequest < 600000) {
  //       throw HTTPError.create(429, 'Cannot send another email so soon');
  //     } else {
  //       // Able to generate another code, so delete the old one
  //       await this.resetModel.update(validation.id, { completed: true });
  //     }
  //     // send validation email
  //     await this.SendValidationEmail({
  //       sendTo,
  //       isParent,
  //       user: data.user,
  //     });
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw err;
  //   }
  // }
  // public async ResendValidationEmail(user: Users.ICleanUser): Promise<void> {
  //   try {
  //     const validation = await this.validationModel.getRecentByUserId(user.id);
  //     if (!validation) {
  //       throw HTTPError.create(404, 'No validation found');
  //     }
  //     await this.SendValidationEmail({
  //       sendTo: validation.email,
  //       isParent: validation.validatorId === Validations.ValidatorEnum.parent,
  //       user,
  //     });
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw err;
  //   }
  // }
  // public async GetResetEmail(email: string) {
  //   try {
  //     const user = await this.userModel.get({ email }, { first: true });
  //     if (!user) throw HTTPError.create(404, 'Email not found');
  //     const resetItem = await this.resetModel.get(
  //       { userId: user.id },
  //       { first: true, orderBy: 'created_at', order: 'DESC' }
  //     );
  //     await this.db.transaction(async () => {
  //       if (resetItem) {
  //         const timeSinceLastRequest =
  //           Date.now() - resetItem.created_at.getTime();
  //         if (timeSinceLastRequest < 600000) {
  //           throw HTTPError.create(429, 'Cannot send another email so soon');
  //         } else {
  //           // Able to generate another code, so delete the old one
  //           await this.resetModel.update(resetItem.id, { completed: true });
  //         }
  //       }
  //       const code = this.generateResetCode(user);
  //       await this.resetModel.add({ code, userId: user.id });
  //       await this.mailer.sendPasswordResetEmail(user, code);
  //     });
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw err;
  //   }
  // }
  // public async ResetPasswordWithCode(
  //   email: string,
  //   password: string,
  //   token: string
  // ) {
  //   try {
  //     const user = await this.userModel.get({ email }, { first: true });
  //     if (!user) throw HTTPError.create(404, 'Email not found');
  //     const resetItem = await this.resetModel.get(
  //       { userId: user.id },
  //       { first: true }
  //     );
  //     if (!resetItem)
  //       throw HTTPError.create(409, 'No password resets are active');
  //     if (resetItem.code !== token)
  //       throw HTTPError.create(401, 'Invalid password reset code');
  //     this.logger.debug(
  //       `Password reset code verified for user (ID: ${user.id})`
  //     );
  //     const hashedPassword = await this.hashPassword(password);
  //     await this.db.transaction(async () => {
  //       await this.userModel.update(user.id, {
  //         password: hashedPassword,
  //         updated_at: (DateTime.utc().toISO() as unknown) as Date,
  //       });
  //       await this.resetModel.update(resetItem.id, { completed: true });
  //     });
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw err;
  //   }
  // }
  // private async SendValidationEmail(args: {
  //   sendTo: string;
  //   isParent: boolean;
  //   user: Users.ICleanUser;
  // }) {
  //   // Generate Validation for user
  //   const { url, code } = this.generateValidationURL(
  //     args.user.codename,
  //     args.sendTo
  //   );
  //   await this.validationModel.add({
  //     code,
  //     userId: args.user.id,
  //     email: args.sendTo,
  //     validatorId: args.isParent
  //       ? Validations.ValidatorEnum.parent
  //       : Validations.ValidatorEnum.user,
  //   });
  //   if (!args.isParent) {
  //     await this.mailer.sendValidationEmail(args.sendTo, url);
  //   } else {
  //     await this.mailer.sendParentValidationEmail(
  //       args.sendTo,
  //       url,
  //       args.user.firstname
  //     );
  //   }
  // }
  // public generateToken(user: Omit<Users.IUser, 'password'>) {
  //   this.logger.debug(`Generating JWT for user (ID: ${user.id})`);
  //   const exp = DateTime.utc().plus({ days: env.AUTH_TOKEN_EXP_TIME });
  //   this.logger.debug(`Signing JWT for user (ID: ${user.id})`);
  //   return jwt.create(
  //     { alg: env.JWT.ALGO },
  //     {
  //       exp: exp.valueOf(),
  //       id: user.id.toString(),
  //       email: user.email,
  //       codename: user.codename,
  //     },
  //     env.JWT.SECRET
  //   );
  // }
  // private generateValidationURL(codename: string, email: string) {
  //   try {
  //     this.logger.debug(
  //       `Generating email validation token for user (EMAIL: ${email})`
  //     );
  //     const token = v5(codename, env.UUID_NAMESPACE);
  //     const urlParams = new URLSearchParams({ token, email });
  //     const url =
  //       env.SERVER_URL + '/api/auth/activation?' + urlParams.toString();
  //     return { url, code: token };
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw err;
  //   }
  // }
  // private generateResetCode(user: Users.IUser) {
  //   try {
  //     this.logger.debug(
  //       `Generating a new password reset code for user (ID: ${user.id})`
  //     );
  //     const resetToken = v5(user.codename, env.UUID_NAMESPACE);
  //     this.logger.debug(`Reset code generated for user (ID: ${user.id})`);
  //     return resetToken;
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw err;
  //   }
  // }
  // public async hashPassword(password: string) {
  //   this.logger.debug('Hashing password');
  //   const salt = await bcrypt.genSalt(8);
  //   const hashedPassword = await bcrypt.hash(password, salt);
  //   this.logger.debug('Password hashed');
  //   return hashedPassword;
  // }
}
