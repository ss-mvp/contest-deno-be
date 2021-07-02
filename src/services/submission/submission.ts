import { Service } from 'typedi';
import { API, Clash, DS, Sources, Submissions, Users } from '../../interfaces';
import {
  DSModel,
  PromptModel,
  SubmissionModel,
  Top3Model,
  UserModel,
} from '../../models';
import { HTTPError } from '../../utils';
import BaseService from '../baseService';
import { BucketService } from '../bucket';
import { DSService } from '../ds';

@Service()
export default class SubmissionService extends BaseService {
  constructor(
    private bucketService: BucketService,
    private submissionModel: SubmissionModel,
    private userModel: UserModel,
    private promptModel: PromptModel,
    private top3Model: Top3Model,
    private dsService: DSService,
    private dsModel: DSModel
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
    const user = await this.userModel.get({ id: userId }, { first: true });

    if (!user) throw HTTPError.create(404, 'User not found');

    // Query the S3 bucket/database for submission info
    const subItems = await Promise.all(
      subs.map((s) => this.retrieveSubItem(s, user))
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

    const top3 = await this.db
      .table('top3')
      .innerJoin('submissions', 'submissions.id', 'top3.submissionId')
      .where('submissions.promptId', promptId)
      .select('submissions.*');

    return { subs: processedSubs, hasVoted: top3.length > 0 };
  }

  public async getById(id: number) {
    try {
      const sub = await this.submissionModel.get({ id }, { first: true });
      if (!sub) throw HTTPError.create(404, 'Submission not found');

      const subItem = await this.retrieveSubItem(sub);
      return subItem;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getTop3Subs() {
    // Pull top 3 subs from the table
    const top3 = await this.db
      .table('top3')
      .innerJoin('submissions', 'submissions.id', 'top3.submissionId')
      .orderBy('top3.created_at', 'DESC')
      .limit(3)
      .select('submissions.*');

    // Process them and read in image data from S3 and return them
    const subs = await Promise.all(top3.map((t) => this.retrieveSubItem(t)));
    return subs;
  }

  public async setTop3(ids: number[]) {
    try {
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
      const sub = await this.retrieveSubItem(winner);
      return sub;
    } else {
      return undefined;
    }
  }

  public async processSubmission({
    promptId,
    uploadResponse,
    user,
    sourceId = Sources.SubSrcEnum.FDSC, // Default to FDSC
    rumbleId,
    transcription,
    transcriptionSourceId = Sources.DsTrscSrcEnum.DS,
  }: {
    uploadResponse: API.middleware.upload.IResponseWithChecksum;
    promptId: number;
    user: Users.IUser;
    sourceId: Sources.SubSrcEnum & number;
    rumbleId?: number;
    transcriptionSourceId: Sources.DsTrscSrcEnum & number;
    transcription?: string;
  }) {
    try {
      this.logger.debug('sending', uploadResponse, 'to ds');
      const dsResponse = await this.dsService.sendSubmissionToDS({
        pages: [uploadResponse],
        promptId,
      });
      this.logger.debug('recieved', dsResponse, 'from ds');

      this.logger.debug('formatting');
      const newSub = this.formatNewSub(
        uploadResponse,
        dsResponse,
        promptId,
        user.id,
        sourceId,
        rumbleId
      );
      this.logger.debug('formatted sub successfully:', newSub);

      this.logger.debug('adding new sub', newSub);
      const submission = await this.submissionModel.add(newSub, true);
      if (!submission) throw HTTPError.create(409, 'Could not add to database');
      this.logger.debug('new submission created', submission);

      this.logger.debug('retrieving sub item with id', submission.id);
      const subItem = await this.retrieveSubItem(submission, user);
      this.logger.debug('sub item retrieved', subItem);

      try {
        await this.dsModel.addTranscription({
          uploadResponse,
          dsResponse,
          subItem,
          user,
          sourceId,
          transcription,
          transcriptionSourceId,
        });
      } catch (err) {
        this.logger.info(
          `Failed to save submission ${submission.id} to DS database`
        );
      }

      return subItem;
    } catch (err) {
      // If any part of upload fails, attempt to remove the item from the bucket for data integrity
      // try {
      //   await this.bucketService.remove(uploadResponse.s3Label);
      // } catch (err) {
      //   this.logger.critical(
      //     `S3 object ${uploadResponse.s3Label} is untracked!`
      //   );
      // }
      this.logger.error(err);
      throw err;
    }
  }

  public async getFlagsBySubId(submissionId: number) {
    try {
      const flags = await this.db
        .table('submission_flags')
        .innerJoin('enum_flags', 'enum_flags.id', 'submission_flags.flagId')
        .select('enum_flags.flag')
        .where('submission_flags.submissionId', submissionId);

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
        .returning('*');
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
        .delete();
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async retrieveSubItem(
    sub: Submissions.ISubmission,
    user?: Users.IUser
  ): Promise<Submissions.ISubItem> {
    try {
      // Generate img src tag
      const src = await this.getImgSrc(sub);

      // Get prompt
      const { prompt } = await this.promptModel.get(
        { id: sub.promptId },
        { first: true }
      );

      // Get User
      if (!user) {
        const userInfo = await this.userModel.get(
          { id: sub.userId },
          { first: true }
        );
        user = userInfo;
      }

      // Remove s3 info from the response and add the image data
      return {
        id: sub.id,
        src,
        score: sub.score,
        prompt,
        rotation: sub.rotation,
        codename: user.codename,
        userId: sub.userId,
        rumbleId: sub.rumbleId,
        dob: user.dob,
        created_at: sub.created_at,
      };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  private formatNewSub(
    { ETag, s3Label }: API.middleware.upload.IResponse,
    {
      Confidence: confidence,
      Rotation: rotation,
      SquadScore: score,
    }: DS.api.IDSAPITextSubmissionResponse,
    promptId: number,
    userId: number,
    sourceId: Sources.SubSrcEnum & number,
    rumbleId?: number
  ): Submissions.INewSubmission {
    return {
      confidence: Math.round(confidence),
      score: Math.round(score),
      rotation: Math.round(rotation),
      etag: ETag,
      s3Label,
      userId,
      promptId,
      sourceId,
      rumbleId,
    };
  }

  public async getImgSrc(sub: Submissions.ISubmission) {
    try {
      const fromS3 = await this.bucketService.get(sub.s3Label, sub.etag);
      const bufferString = btoa(
        fromS3.Body?.toString() || ''
        // fromS3.Body?.reduce(
        //   (data, byte) => data + String.fromCharCode(byte),
        //   ''
        // )
      );
      return `data:application/octet-stream;base64,${bufferString}`;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
