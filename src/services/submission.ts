import { createError, Inject, Service, serviceCollection } from '../../deps.ts';
import {
  IDSAPIPageSubmission,
  IProcessedDSResponse,
  IUploadResponse,
} from '../interfaces/dsServiceTypes.ts';
import { Sources } from '../interfaces/enumSources.ts';
import {
  INewSubmission,
  ISubItem,
  ISubmission,
} from '../interfaces/submissions.ts';
import { INewTop3 } from '../interfaces/top3.ts';
import PromptModel from '../models/prompts.ts';
import SubmissionModel from '../models/submissions.ts';
import Top3Model from '../models/top3.ts';
import UserModel from '../models/users.ts';
import BaseService from './baseService.ts';
import BucketService from './bucket.ts';
import DSService from './dsService.ts';

@Service()
export default class SubmissionService extends BaseService {
  constructor(
    @Inject(BucketService) private bucketService: BucketService,
    @Inject(SubmissionModel) private submissionModel: SubmissionModel,
    @Inject(UserModel) private userModel: UserModel,
    @Inject(PromptModel) private promptModel: PromptModel,
    @Inject(Top3Model) private top3Model: Top3Model,
    @Inject(DSService) private dsService: DSService
  ) {
    super();
  }

  public async getUserSubs(
    userId: number,
    config: { limit: number; offset: number }
  ) {
    const subs = await this.submissionModel.get(
      { userId },
      {
        limit: config.limit,
        offset: config.offset,
        orderBy: 'created_at',
        order: 'DESC',
      }
    );

    // Pull codename for use in the retrieve subs, this reduces queries to db
    const { codename } = await this.userModel.get(
      { id: userId },
      { first: true }
    );
    // Query the S3 bucket/database for submission info
    const subItems = await Promise.all(
      subs.map((s) => this.retrieveSubItem(s, codename))
    );

    return subItems;
  }

  public async getTopTen() {
    const { id: promptId } = await this.promptModel.get(
      { active: true },
      { first: true }
    );

    const subs = await this.submissionModel.get(
      { promptId },
      {
        limit: 10,
        orderBy: 'score',
        order: 'DESC',
      }
    );
    const processedSubs = await Promise.all(
      subs.map((s) => this.retrieveSubItem(s))
    );

    const top3 = ((await this.db
      .table('top3')
      .innerJoin('submissions', 'submissions.id', 'top3.submissionId')
      .where('submissions.promptId', promptId)
      .select('submissions.*')
      .execute()) as unknown[]) as ISubmission[];

    return { subs: processedSubs, hasVoted: top3.length > 0 };
  }

  public async getById(id: number) {
    try {
      const sub = await this.submissionModel.get({ id }, { first: true });
      if (!sub) throw createError(404, 'Submission not found');

      const subItem = await this.retrieveSubItem(sub);
      return subItem;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getTop3Subs() {
    // Pull top 3 subs from the table
    const top3 = ((await this.db
      .table('top3')
      .innerJoin('submissions', 'submissions.id', 'top3.submissionId')
      .order('top3.created_at', 'DESC')
      .limit(3)
      .select('submissions.*')
      .execute()) as unknown) as ISubmission[];

    // Process them and read in image data from S3 and return them
    const subs = await Promise.all(top3.map((t) => this.retrieveSubItem(t)));
    return subs;
  }

  public async setTop3(ids: number[]) {
    try {
      const formattedTop3: INewTop3[] = ids.map((id) => ({
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
    const [winner] = ((await this.db
      .table('winners')
      .innerJoin('submissions', 'submissions.id', 'winners.submissionId')
      .order('winners.created_at', 'DESC')
      .select('submissions.*')
      .limit(1)
      .execute()) as unknown) as ISubmission[];

    // Process winner into a sub item and return it
    if (winner) {
      const sub = await this.retrieveSubItem(winner);
      return sub;
    } else {
      return undefined;
    }
  }

  public async processSubmission({
    promptId,
    uploadResponse,
    userId,
    sourceId = Sources.FDSC, // Default to FDSC
    rumbleId,
  }: {
    uploadResponse: IDSAPIPageSubmission;
    promptId: number;
    userId: number;
    sourceId: Sources & number;
    rumbleId?: number;
  }) {
    try {
      const dsReponse = await this.dsService.sendSubmissionToDS([
        uploadResponse,
      ]);

      const newSub = this.formatNewSub(
        uploadResponse,
        dsReponse,
        promptId,
        userId,
        sourceId,
        rumbleId
      );

      let submission: ISubmission | undefined;
      await this.db.transaction(async () => {
        submission = await this.submissionModel.add(newSub, true);
      });
      if (!submission) throw createError(409, 'File upload failed');

      return this.retrieveSubItem(submission);
    } catch (err) {
      // If any part of upload fails, attempt to remove the item from the bucket for data integrity
      try {
        await this.bucketService.remove(uploadResponse.s3Label);
      } catch (err) {
        this.logger.critical(
          `S3 object ${uploadResponse.s3Label} is untracked!`
        );
      }
      this.logger.error(err);
      throw err;
    }
  }

  public async getFlagsBySubId(submissionId: number) {
    try {
      const flags = ((await this.db
        .table('submission_flags')
        .innerJoin('enum_flags', 'enum_flags.id', 'submission_flags.flagId')
        .select('enum_flags.flag')
        .where('submission_flags.submissionId', submissionId)
        .execute()) as unknown) as { flag: string }[];

      const parsedFlags = flags.map((flag) => flag.flag);
      return parsedFlags;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async flagSubmission(
    submissionId: number,
    flagIds: number[],
    creatorId?: number
  ) {
    try {
      const flagItems = flagIds.map((flagId) => ({
        flagId,
        submissionId: submissionId,
        creatorId,
      }));
      const flags = await this.db
        .table('submission_flags')
        .insert(flagItems)
        .returning('*')
        .execute();
      return flags;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async removeFlag(submissionId: number, flagId: number) {
    try {
      await this.db
        .table('submission_flags')
        .where('submissionId', submissionId)
        .where('flagId', flagId)
        .delete()
        .execute();
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async retrieveSubItem(
    sub: ISubmission,
    codename?: string
  ): Promise<ISubItem> {
    try {
      // Generate img src tag
      const src = await this.getImgSrc(sub);

      // Get prompt
      const { prompt } = await this.promptModel.get(
        { id: sub.promptId },
        { first: true }
      );

      // Get Codename
      if (!codename) {
        const user = await this.userModel.get(
          { id: sub.userId },
          { first: true }
        );
        codename = user.codename;
      }

      // Remove s3 info from the response and add the image data
      return {
        id: sub.id,
        src,
        score: sub.score,
        prompt,
        rotation: sub.rotation,
        codename,
        userId: sub.userId,
        rumbleId: sub.rumbleId,
      };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  private formatNewSub(
    { etag, s3Label }: IUploadResponse,
    { confidence, rotation, score, transcription }: IProcessedDSResponse,
    promptId: number,
    userId: number,
    sourceId: Sources & number,
    rumbleId?: number
  ): INewSubmission {
    return {
      confidence,
      score,
      transcription,
      rotation,
      etag,
      s3Label,
      userId,
      promptId,
      sourceId,
      rumbleId,
    };
  }

  public async getImgSrc(sub: ISubmission) {
    try {
      const fromS3 = await this.bucketService.get(sub.s3Label, sub.etag);
      const bufferString = btoa(
        fromS3.body.reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      return `data:application/octet-stream;base64,${bufferString}`;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}

serviceCollection.addTransient(SubmissionService);
