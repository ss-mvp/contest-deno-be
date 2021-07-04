import { DateTime } from 'luxon';
import { Service } from 'typedi';
import { Clash } from '../../interfaces';
import {
  PromptModel,
  SubmissionModel,
  Top3Model,
  VoteModel,
} from '../../models';
import BaseService from '../baseService';
import { SubmissionService } from '../submission';

@Service()
export default class ClashService extends BaseService {
  constructor(
    private voteModel: VoteModel,
    private subModel: SubmissionModel,
    private promptModel: PromptModel,
    private subService: SubmissionService,
    private top3Model: Top3Model
  ) {
    super();
  }

  public async submitVote(
    subIds: number[] | Clash.votes.INewVote,
    userId?: number
  ) {
    try {
      let voteItem: Clash.votes.INewVote;

      if (Array.isArray(subIds)) {
        voteItem = {
          firstPlaceId: subIds[0],
          secondPlaceId: subIds[1],
          thirdPlaceId: subIds[2],
          userId,
        };
      } else {
        voteItem = subIds;
      }
      await this.voteModel.add(voteItem);

      const nextPrompt = await this.promptModel.getNext();
      return nextPrompt;
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

  public async getTop3Subs() {
    // Pull top 3 subs from the table
    const top3 = await this.top3Model.getSubs();
    // Process them and read in image data from S3 and return them
    const subs = await Promise.all(
      top3.map((t) => this.subService.retrieveSubItem(t))
    );
    return subs;
  }

  public async setTop3(ids: number[]) {
    try {
      // Put the ids in the right format for the top3 table
      const formattedTop3: Clash.top3.INewTop3[] = ids.map((id) => ({
        submissionId: id,
      }));
      const top3 = await this.top3Model.add(formattedTop3);
      return top3;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getRecentWinner() {
    // Pull recent winner from the table
    const [winner] = await this.db
      .table('winners')
      .innerJoin('submissions', 'submissions.id', 'winners.submissionId')
      .orderBy('winners.created_at', 'DESC')
      .select('submissions.*')
      .limit(1);

    // Process winner into a sub item and return it
    if (winner) {
      const sub = await this.subService.retrieveSubItem(winner);
      return sub;
    } else {
      return undefined;
    }
  }

  public async getTopTen() {
    const { id: promptId } = await this.promptModel.get(
      { active: true },
      { first: true }
    );

    const subs = await this.subModel.get(
      { promptId },
      {
        limit: 10,
        orderBy: 'score',
        order: 'DESC',
      }
    );
    const processedSubs = await Promise.all(
      subs.map((s) => this.subService.retrieveSubItem(s))
    );

    const top3 = await this.db
      .table('top3')
      .innerJoin('submissions', 'submissions.id', 'top3.submissionId')
      .where('submissions.promptId', promptId)
      .select('submissions.*');

    return { subs: processedSubs, hasVoted: top3.length > 0 };
  }
}
