import { Service, serviceCollection } from '../../deps.ts';
import { INewUser, IUser, IValidationByUser } from '../interfaces/users.ts';
import BaseModel from './baseModel.ts';

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
}

serviceCollection.addTransient(UserModel);
