import { Service } from 'typedi';
import { Feedback } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class RumbleFeedbackModel extends BaseModel<
  Feedback.INewFeedbackItem,
  Feedback.IFeedbackItem
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
  }): Promise<Feedback.IFeedbackItem[]> {
    const feedback = await this.db('rumble_feedback')
      .innerJoin(
        'submissions',
        'submissions.id',
        'rumble_feedback.submissionId'
      )
      .innerJoin('prompts', 'prompts.id', 'submissions.promptId')
      .innerJoin('rumbles', 'rumbles.promptId', 'prompts.id')
      .where('rumble_feedback.voterId', voterId)
      .where('rumbles.id', rumbleId)
      .select('rumble_feedback.*');

    return feedback;
  }

  public async updateFeedback({
    submissionId,
    voterId,
    ...scores
  }: Omit<Feedback.IFeedbackItem, 'id'>): Promise<void> {
    await this.db
      .table('rumble_feedback')
      .where('voterId', voterId)
      .where('submissionId', submissionId)
      .update(scores);
  }
}
