import { Service, serviceCollection } from '../../deps.ts';
import { INewValidation, IValidation } from '../interfaces/validations.ts';
import BaseModel from './baseModel.ts';

@Service()
export default class ValidationModel extends BaseModel<
  INewValidation,
  IValidation
> {
  constructor() {
    super('validations');
  }

  public async getRecentByUserId(
    userId: number
  ): Promise<IValidation | undefined> {
    const [validation] = await this.get(
      { userId },
      { orderBy: 'created_at', order: 'DESC', limit: 1 }
    );
    return validation;
  }
}

serviceCollection.addTransient(ValidationModel);
