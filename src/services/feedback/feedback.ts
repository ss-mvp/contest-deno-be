import { Service } from 'typedi';
import { RumbleFeedbackModel } from '../../models';
import BaseService from '../baseService';

@Service()
export default class FeedbackService extends BaseService {
  constructor(private feedbackModel: RumbleFeedbackModel) {
    super();
  }

  public async checkIfFeedbackWasSubmitted({
    rumbleId,
    studentId,
  }: {
    rumbleId: number;
    studentId: number;
  }): Promise<boolean> {
    try {
      // Get the feedback that the student gave in this rumble
      const feedback = await this.feedbackModel.getFeedbackByRumbleAndVoterIds({
        rumbleId,
        voterId: studentId,
      });

      // Check if they've actually voted
      const hasVoted = feedback.some(
        (fbItem) => !!fbItem.score1 || !!fbItem.score2 || !!fbItem.score3
      );

      return hasVoted;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
