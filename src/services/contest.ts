import { Inject, moment, Service, serviceCollection } from '../../deps';
import { INewVote } from '../interfaces/votes';
import PromptModel from '../models/prompts';
import VoteModel from '../models/votes';
import BaseService from './baseService';

@Service()
export default class ContestService extends BaseService {
  constructor(
    @Inject(VoteModel) private voteModel: VoteModel,
    @Inject(PromptModel) private promptModel: PromptModel
  ) {
    super();
  }

  public async submitVote(subIds: number[], userId?: number) {
    try {
      const voteItem: INewVote = {
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

  public async getLeaderboard() {
    const fromDate = moment.utc().hour(0).minute(0).second(0).subtract(7, 'd');

    const query = `SELECT "users"."id", "users"."codename",
      SUM("submissions"."score") AS score 
      FROM "submissions" 
      INNER JOIN "users" ON "users"."id" = "submissions"."userId" 
      WHERE "submissions"."created_at" >= '${fromDate.format()}'
      GROUP BY "users"."id" 
      ORDER BY score DESC LIMIT 10;`.replace(/\s\s+/g, ' '); // Replace all whitespace with a single space
    const subs = await this.db.query(query);
    return subs;
  }
}

serviceCollection.addTransient(ContestService);
