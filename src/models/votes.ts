import { Service, serviceCollection } from '../../deps';
import { INewVote, IVote } from '../interfaces/votes';
import BaseModel from './baseModel';

@Service()
export default class VoteModel extends BaseModel<INewVote, IVote> {
  constructor() {
    super('votes');
  }
}

serviceCollection.addTransient(VoteModel);
