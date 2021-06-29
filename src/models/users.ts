import { Service, serviceCollection } from '../../deps';
import { SSOLookups } from '../interfaces/ssoLookups';
import { INewUser, IUser, IValidationByUser } from '../interfaces/users';
import BaseModel from './baseModel';

@Service()
export default class UserModel extends BaseModel<INewUser, IUser> {
  constructor() {
    super('users');
  }

  public async getUserByResetEmail(resetEmail: string) {
    this.logger.debug(`Retrieving user account from reset email ${resetEmail}`);

    const [user] = (await this.db
      .table('users')
      .innerJoin('validations', 'users.id', 'validations.userId')
      .where('validations.email', resetEmail)
      .order('validations.id', 'DESC')
      .first()
      .select(
        ['validations.email', 'validationEmail'],
        ['validations.id', 'validationId'],
        'users.isValidated',
        'users.id',
        'validations.code'
      )
      .execute()) as IValidationByUser[];

    this.logger.debug('User retrieved');
    return user;
  }

  public async getRole(userId: number) {
    this.logger.debug(`Getting role for user (ID: ${userId})`);

    const [role] = (await this.db
      .table('users')
      .innerJoin('roles', 'roles.id', 'users.roleId')
      .where('id', userId)
      .select('roles.id', 'roles.role')
      .execute()) as { id: number; role: string }[];

    return role;
  }

  public async findByCleverId(cleverId: string) {
    this.logger.debug(`Attempting to retrieve user with clever id ${cleverId}`);

    const [user] = ((await this.db
      .table('users')
      .innerJoin('sso_lookup', 'users.id', 'sso_lookup.userId')
      .where('sso_lookup.providerId', SSOLookups.Clever)
      .where('sso_lookup.accessToken', cleverId)
      .select('users.*')
      .execute()) as unknown) as (IUser | undefined)[];

    return user;
  }
}

serviceCollection.addTransient(UserModel);
