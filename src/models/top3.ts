import { Service } from 'typedi';
import { Clash } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class Top3Model extends BaseModel<
  Clash.top3.INewTop3,
  Clash.top3.ITop3
> {
  constructor() {
    super('top3');
  }
}
