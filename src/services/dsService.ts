import { axiod, Inject, log, Service, serviceCollection } from '../../deps.ts';
import env from '../config/env.ts';
import {
  IDSAPIPageSubmission,
  IDSAPITextSubmissionPostBody,
  IDSAPITextSubmissionResponse,
  IProcessedDSResponse,
} from '../interfaces/dsServiceTypes.ts';
import { INewRumbleFeedback } from '../interfaces/rumbleFeedback.ts';

const DSClient = axiod.create({
  baseURL: env.DS_API_URL,
  headers: {
    Authorization: env.DS_API_TOKEN,
  },
});

@Service()
export default class DSService {
  constructor(@Inject('logger') private logger: log.Logger) {}

  /**
   * IMPORTANT! The DS API expects a field called file key but that key
   * is the S3 key of the file. The upload middleware incorrect
   */
  public async sendSubmissionToDS(
    pages: IDSAPIPageSubmission[]
  ): Promise<IProcessedDSResponse> {
    /* Mock Data */
    await pages; // Shut up linter?
    const res = await Promise.resolve<IDSAPITextSubmissionResponse>({
      Transcription: 'asdaksfmnasdlkcfmnasdlfkasmfdlkasdf',
      Confidence: 50,
      SquadScore: Math.floor(Math.random() * 40 + 10), // Rand 10-50
      Rotation: 0,
      ModerationFlag: false,
      SubmissionID: 1,
    });
    // const formattedPages = pages.reduce<
    //   Record<string, Pick<IDSAPIPageSubmission, 'Checksum' | 'filekey'>>
    // >(
    //   (acc, page, index) => ({
    //     ...acc,
    //     [`${index}`]: {
    //       Checksum: page.Checksum,
    //       filekey: page.s3Label,
    //     },
    //   }),
    //   {}
    // );
    // console.log('pages', pages);
    // console.log('formatted pages', formattedPages);
    // const res = await this.submitTextSubmissionToDSAPI({
    //   StoryId: 1,
    //   SubmissionID: 1,
    //   Pages: formattedPages,
    // });
    return this.formatDSTextSubmission(res);
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

  private async submitTextSubmissionToDSAPI(
    body: IDSAPITextSubmissionPostBody
  ): Promise<IProcessedDSResponse> {
    try {
      console.log('ds req start');
      const { data } = (await DSClient.post(`/submission/text`, body)) as {
        data: IDSAPITextSubmissionResponse;
      };
      console.log('ds req end');
      // Format the returned data
      return this.formatDSTextSubmission(data);
    } catch (err) {
      this.logger.error('text sub', err);
      throw err;
    }
  }

  private formatDSTextSubmission(
    data: IDSAPITextSubmissionResponse
  ): IProcessedDSResponse {
    // TODO do something with transcription and moderation flag
    return {
      confidence: data.Confidence,
      rotation: data.Rotation,
      score: data.SquadScore,
      transcription: data.Transcription,
    };
  }
}

serviceCollection.addTransient(DSService);
