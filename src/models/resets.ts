import { Service } from 'typedi';
import { Auth } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class ResetModel extends BaseModel<
  Auth.resets.INewReset,
  Auth.resets.IReset
> {
  constructor() {
    super('resets');
  }
}
