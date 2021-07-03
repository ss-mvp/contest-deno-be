import { Service } from 'typedi';
import { Clash, Submissions } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class Top3Model extends BaseModel<
  Clash.top3.INewTop3,
  Clash.top3.ITop3
> {
  constructor() {
    super('top3');
  }

  public async getSubs(): Promise<Submissions.ISubmission[]> {
    const top3Subs = await this.db('top3')
      .innerJoin('submissions', 'submissions.id', 'top3.submissionId')
      .orderBy('top3.created_at', 'DESC')
      .limit(3)
      .select('submissions.*');
    return top3Subs;
  }
}
