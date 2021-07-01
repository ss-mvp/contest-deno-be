import axios, { AxiosInstance } from 'axios';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { env } from '../../config';
import { API, DS, Feedback } from '../../interfaces';

@Service()
export default class DSService {
  // A connection to the DS FastAPI server on Elastic Beanstalk
  private api: AxiosInstance;
  constructor(@Inject('logger') private logger: Logger) {
    this.api = axios.create(env.DS_API_CONFIG);
  }

  public async sendSubmissionToDS({
    pages,
    promptId,
    submissionId = 0,
  }: {
    pages: API.middleware.upload.IResponseWithChecksum[];
    promptId: number;
    submissionId?: number;
  }): Promise<DS.api.IDSAPITextSubmissionResponse> {
    /* Mock Data */
    // const res = await Promise.resolve<DS.api.IDSAPITextSubmissionResponse>({
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
  ): Feedback.INewFeedbackItem[] {
    const response: Feedback.INewFeedbackItem[] = [];
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
    body: DS.api.IDSAPITextSubmissionPostBody
  ): Promise<DS.api.IDSAPITextSubmissionResponse> {
    try {
      console.log('ds req start', body);
      const { data } = await this.api.post(`/submission/text`, body);
      console.log('ds req end', data);
      return data;
    } catch (err) {
      this.logger.error('text sub', { err });
      throw err;
    }
  }
}
