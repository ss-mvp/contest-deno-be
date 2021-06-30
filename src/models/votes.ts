import { Service } from 'typedi';
import { Clash } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class VoteModel extends BaseModel<
  Clash.votes.INewVote,
  Clash.votes.IVote
> {
  constructor() {
    super('votes');
  }
}
