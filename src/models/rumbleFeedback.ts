import { QueryValues, Service, serviceCollection } from '../../deps';
import {
  INewRumbleFeedback,
  IRumbleFeedback,
} from '../interfaces/rumbleFeedback';
import BaseModel from './baseModel';

@Service()
export default class RumbleFeedbackModel extends BaseModel<
  INewRumbleFeedback,
  IRumbleFeedback
> {
  constructor() {
    super('rumble_feedback');
  }

  public async getFeedbackByRumbleAndVoterIds({
    rumbleId,
    voterId,
  }: {
    rumbleId: number;
    voterId: number;
  }): Promise<IRumbleFeedback[]> {
    const feedback = ((await this.db
      .table('rumble_feedback')
      .innerJoin(
        'submissions',
        'submissions.id',
        'rumble_feedback.submissionId'
      )
      .innerJoin('prompts', 'prompts.id', 'submissions.promptId')
      .innerJoin('rumbles', 'rumbles.promptId', 'prompts.id')
      .where('rumble_feedback.voterId', voterId)
      .where('rumbles.id', rumbleId)
      .select('rumble_feedback.*')
      .execute()) as unknown) as IRumbleFeedback[];

    return feedback;
  }

  public async updateFeedback({
    submissionId,
    voterId,
    ...scores
  }: Omit<IRumbleFeedback, 'id'>): Promise<void> {
    await this.db
      .table('rumble_feedback')
      .where('voterId', voterId)
      .where('submissionId', submissionId)
      .update((scores as unknown) as QueryValues)
      .execute();
  }
}

serviceCollection.addTransient(RumbleFeedbackModel);
