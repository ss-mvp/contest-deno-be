import { Service, serviceCollection } from '../../deps';
import BaseModel from './baseModel';

@Service()
export default class VoteModel extends BaseModel<Contest, IVote> {
  constructor() {
    super('votes');
  }
}

serviceCollection.addTransient(VoteModel);
