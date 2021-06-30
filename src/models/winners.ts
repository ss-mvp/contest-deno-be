import { Service } from 'typedi';
import { Clash } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class WinnerModel extends BaseModel<
  Clash.winners.INewWinner,
  Clash.winners.IWinner
> {
  constructor() {
    super('winners');
  }
}
