import { axiod, Inject, log, Service, serviceCollection } from '../../deps';
import env from '../config/env';
import {
  IDSAPIPageSubmission,
  IDSAPITextSubmissionPostBody,
  IDSAPITextSubmissionResponse,
} from '../interfaces/dsServiceTypes';
import { INewRumbleFeedback } from '../interfaces/rumbleFeedback';

@Service()
export default class DSService {
  // A connection to the DS FastAPI server on Elastic Beanstalk
  constructor(@Inject('logger') private logger: log.Logger) {}

  public async sendSubmissionToDS({
    pages,
    promptId,
    submissionId = 0,
  }: {
    pages: IDSAPIPageSubmission[];
    promptId: number;
    submissionId?: number;
  }): Promise<IDSAPITextSubmissionResponse> {
    /* Mock Data */
    // const res = await Promise.resolve<IDSAPITextSubmissionResponse>({
    //   Transcription: 'asdaksfmnasdlkcfmnasdlfkasmfdlkasdf',
    //   Confidence: 50,
    //   SquadScore: Math.floor(Math.random() * 40 + 10), // Rand 10-50
    //   Rotation: 0,
    //   ModerationFlag: false,
    //   SubmissionID: 1,
    // });
    const formattedPages = pages.reduce(
      (acc, page, index) => ({
        ...acc,
        [`${index + 1}`]: {
          Checksum: page.Checksum,
          filekey: page.s3Label,
        },
      }),
      {}
    );
    // TODO look into removing these?
    const dsReqBody = {
      StoryId: promptId,
      SubmissionID: submissionId,
      Pages: formattedPages,
    };
    const res = await this.sendText(dsReqBody);
    return res;
  }

  /**
   * Written by Robert Sharp for Python, migrated to Typescript.
   */
  public generateFeedbackMatchups(
    subs: {
      userId: number;
      submissionId: number;
    }[]
  ): INewRumbleFeedback[] {
    const response: INewRumbleFeedback[] = [];
    const userIds: number[] = [];
    const submissionIds: number[] = [];

    subs.forEach((r) => {
      userIds.push(r.userId);
      submissionIds.push(r.submissionId);
    });

    // Edge cases to handle situations with < 4 submissions
    if (subs.length === 2 || subs.length === 3) {
      userIds.forEach((uId, i) => {
        submissionIds.forEach((sId, j) => {
          if (i !== j) response.push({ submissionId: sId, voterId: uId });
        });
      });
    } else if (subs.length === 1 || subs.length === 0) {
      // do nothing
    } else {
      // standard use case
      // move helpers somewhere else?
      const rotate = <Type>(arr: Type[], by: number): Type[] => [
        ...arr.slice(by),
        ...arr.slice(0, by),
      ];
      const zip = <Type>(...arrs: Type[][]): Type[][] =>
        arrs.map((_, i) => arrs.map((arr) => arr[i]));

      const rot1 = rotate(submissionIds, 1);
      const rot2 = rotate(submissionIds, 2);
      const rot3 = rotate(submissionIds, 3);

      console.log(subs, rot1, rot2, rot3);

      zip(userIds, rot1, rot2, rot3).forEach(([userId, ...subIds]) => {
        subIds.forEach((subId) => {
          response.push({ submissionId: subId, voterId: userId });
        });
      });
    }

    console.log('feedback response', response);
    return response;
  }

  private async sendText(
    body: IDSAPITextSubmissionPostBody
  ): Promise<IDSAPITextSubmissionResponse> {
    try {
      console.log('ds req start', body);
      const { data } = await axiod.post(
        `/submission/text`,
        body,
        env.DS_API_CONFIG
      );
      console.log('ds req end', data);
      return data;
    } catch (err) {
      this.logger.error('text sub', { err });
      throw err;
    }
  }
}

serviceCollection.addTransient(DSService);
