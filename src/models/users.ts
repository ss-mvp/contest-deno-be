import { Service } from 'typedi';
import { Roles, SSOLookups, Users } from '../interfaces';
import { hashPassword } from '../utils';
import BaseModel from './baseModel';

@Service()
export default class UserModel extends BaseModel<Users.INewUser, Users.IUser> {
  constructor() {
    super('users');
  }

  public async getUserByValidationEmail(
    validationEmail: string
  ): Promise<Users.IValidationByUser | undefined> {
    this.logger.debug(
      `Retrieving user account from validation email ${validationEmail}`
    );

    const user = await this.db('users')
      .innerJoin('validations', 'users.id', 'validations.userId')
      .where('validations.email', validationEmail)
      .orderBy('validations.id', 'DESC')
      .select(
        'validations.email as validationEmail',
        'validations.id as validationId',
        'users.isValidated',
        'users.id',
        'validations.code'
      )
      .first();

    return user;
  }

  public async getRole(userId: number) {
    this.logger.debug(`Getting role for user (ID: ${userId})`);

    const role = await this.db('users')
      .innerJoin('roles', 'roles.id', 'users.roleId')
      .where('id', userId)
      .select<Roles.IRole>('roles.id', 'roles.role')
      .first();

    return role;
  }

  public async findByCleverId(cleverId: string) {
    this.logger.debug(`Attempting to retrieve user with clever id ${cleverId}`);

    const user = await this.db('users')
      .innerJoin('sso_lookup', 'users.id', 'sso_lookup.userId')
      .where('sso_lookup.providerId', SSOLookups.LookupEnum.Clever)
      .andWhere('sso_lookup.accessToken', cleverId)
      .select<Users.IUser>('users.*')
      .first();

    return user;
  }

  public async update(id: number, changes: Partial<Users.IUser>) {
    // If the user is changing a password, let's hash it
    let hashedPassword;
    if (changes.password) {
      hashedPassword = await hashPassword(changes.password);
    }
    return super.update(
      id,
      hashedPassword
        ? Object.assign(changes, { password: hashedPassword })
        : changes
    );
  }
}
