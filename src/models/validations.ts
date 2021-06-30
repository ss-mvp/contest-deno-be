import { Service } from 'typedi';
import { Validations } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class ValidationModel extends BaseModel<
  Validations.INewValidation,
  Validations.IValidation
> {
  constructor() {
    super('validations');
  }

  public async getRecentByUserId(
    userId: number
  ): Promise<Validations.IValidation | undefined> {
    const [validation] = await this.get(
      { userId },
      { orderBy: 'created_at', order: 'DESC', limit: 1 }
    );
    return validation;
  }
}
