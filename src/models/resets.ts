import { Service, serviceCollection } from '../../deps';
import { INewReset, IReset } from '../interfaces/Auth/resets';
import BaseModel from './baseModel';

@Service()
export default class ResetModel extends BaseModel<INewReset, IReset> {
  constructor() {
    super('resets');
  }
}

serviceCollection.addTransient(ResetModel);
