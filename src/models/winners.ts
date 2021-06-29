import { Service, serviceCollection } from '../../deps';
import { INewWinner, IWinner } from '../interfaces/winners';
import BaseModel from './baseModel';

@Service()
export default class WinnerModel extends BaseModel<INewWinner, IWinner> {
  constructor() {
    super('winners');
  }
}

serviceCollection.addTransient(WinnerModel);
