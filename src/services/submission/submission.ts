import { Service } from 'typedi';
import { API, DS, Flags, Sources, Submissions, Users } from '../../interfaces';
import {
  DSModel,
  PromptModel,
  SubmissionModel,
  Top3Model,
  UserModel,
} from '../../models';
import { IGetQuery } from '../../models/baseModel';
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
      this.logger.debug('sending ' + uploadResponse.s3Label + ' to ds');
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
      const submission = await this.submissionModel.add(newSub, {
        first: true,
      });
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

  /**
   * Gets a list of a user's recent submissions.
   *
   * @param userId the id of the user to pull submissions for
   * @param paging a configuration to help paginate your responses
   * @returns a list of submission items
   */
  public async getUserSubs(
    userId: number,
    paging: { limit?: number; offset?: number }
  ) {
    // Get the submissions for the user
    const subs = await this.submissionModel.getRecentForUser(userId, paging);

    // Pull codename for use in the retrieve subs, this reduces queries to db
    const user = await this.userModel.get({ id: userId }, { first: true });
    if (!user) throw HTTPError.create(404, 'User not found');

    // Query the S3 bucket/database for submission info
    const subItems = await Promise.all(
      subs.map((s) => this.retrieveSubItem(s, user))
    );

    return subItems;
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

  /**
   * Runs the get query on the submission model and parses the results
   * into submission items to return to the frontend
   */
  public async get<T extends boolean = boolean>(
    getOptions?: IGetQuery<T, keyof Submissions.ISubmission>
  ) {
    try {
      const subs = await this.submissionModel.get(undefined, getOptions);

      const processedSubs: Submissions.ISubItem[] = [];

      if (Array.isArray(subs)) {
        const subItems = await Promise.all(
          subs.map((sub) => this.retrieveSubItem(sub))
        );
        processedSubs.push(...subItems);
      } else {
        const subItem = await this.retrieveSubItem(subs);
        processedSubs.push(subItem);
      }

      return processedSubs;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getFlagsBySubId(submissionId: number) {
    try {
      const flags = await this.submissionModel.getFlagsBySubId(submissionId);
      return flags;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async flagSubmission({
    flagIds,
    submissionId,
    creatorId,
  }: {
    submissionId: number;
    flagIds: number[];
    creatorId?: number;
  }) {
    try {
      /** parse our array of ids into proper flag objects*/
      const newFlags = flagIds.map<Flags.INewSubFlagXref>((flagId) => ({
        flagId,
        submissionId,
        creatorId,
      }));
      // Add the objects to the table
      const flagItems = await this.submissionModel.addFlags(newFlags);
      // Add the flag names to the array of xrefs
      const flags = flagItems.map(this.addFlagName);
      return flags;
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

  private addFlagName(flag: Flags.ISubFlagXref): Flags.IFlagItem {
    return Object.assign(flag, { flag: Flags.FlagEnum[flag.flagId] });
  }

  public async getImgSrc(sub: Submissions.ISubmission) {
    try {
      // TODO figure this stuff out
      const fromS3 = await this.bucketService.get(sub.s3Label, sub.etag);
      const bufferString = fromS3.Body?.toString('base64');
      // const bufferString = btoa(
      // fromS3.Body?.toString() || ''
      // fromS3.Body?.reduce(
      //   (data, byte) => data + String.fromCharCode(byte),
      //   ''
      // )
      // );
      return `data:application/octet-stream;base64,${bufferString}`;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
