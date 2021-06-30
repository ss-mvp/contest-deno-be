import { Service } from 'typedi';
import { SSOLookups, Users } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class UserModel extends BaseModel<Users.INewUser, Users.IUser> {
  constructor() {
    super('users');
  }

  public async getUserByResetEmail(resetEmail: string) {
    this.logger.debug(`Retrieving user account from reset email ${resetEmail}`);

    const user = await this.db('users')
      .innerJoin('validations', 'users.id', 'validations.userId')
      .where('validations.email', resetEmail)
      .orderBy('validations.id', 'DESC')
      .select(
        'validations.email as validationEmail',
        'validations.id as validationId',
        'users.isValidated',
        'users.id',
        'validations.code'
      )
      .first();

    this.logger.debug('User retrieved');
    return user;
  }

  public async getRole(userId: number) {
    this.logger.debug(`Getting role for user (ID: ${userId})`);

    const role = await this.db('users')
      .innerJoin('roles', 'roles.id', 'users.roleId')
      .where('id', userId)
      .select('roles.id', 'roles.role')
      .first();

    return role;
  }

  public async findByCleverId(cleverId: string) {
    this.logger.debug(`Attempting to retrieve user with clever id ${cleverId}`);

    const user = await this.db('users')
      .innerJoin('sso_lookup', 'users.id', 'sso_lookup.userId')
      .where('sso_lookup.providerId', SSOLookups.LookupEnum.Clever)
      .andWhere('sso_lookup.accessToken', cleverId)
      .select('users.*')
      .first();

    return user;
  }
}
