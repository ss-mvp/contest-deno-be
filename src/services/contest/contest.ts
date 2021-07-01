import { DateTime } from 'luxon';
import { Service } from 'typedi';
import { Clash } from '../../interfaces';
import { SubmissionModel, VoteModel } from '../../models';
import BaseService from '../baseService';

@Service()
export default class ContestService extends BaseService {
  constructor(private voteModel: VoteModel, private subModel: SubmissionModel) {
    super();
  }

  public async submitVote(subIds: number[], userId?: number) {
    try {
      const voteItem: Clash.votes.INewVote = {
        firstPlaceId: subIds[0],
        secondPlaceId: subIds[1],
        thirdPlaceId: subIds[2],
        userId,
      };
      await this.voteModel.add(voteItem);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getLeaderboard(): Promise<Clash.ILeaderboardItem[]> {
    const fromDate = DateTime.utc()
      .set({ hour: 0, minute: 0, second: 0 })
      .minus({ day: 7 });

    const leaderboard = await this.subModel.getLeaderboardFrom(fromDate);
    return leaderboard;
  }
}
