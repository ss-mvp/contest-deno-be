import { axiod, Inject, log, Service, serviceCollection } from '../../deps.ts';
import env from '../config/env.ts';
import { INewRumbleFeedback } from '../interfaces/rumbleFeedback.ts';
import { IDSResponse } from '../interfaces/submissions.ts';

@Service()
export default class DSService {
  constructor(@Inject('logger') private logger: log.Logger) {
    this.api = axiod.create({
      baseURL: env.DS_API_URL,
      headers: {
        Authorization: env.DS_API_TOKEN,
      },
    });
  }
  private api: typeof axiod;

  public async sendSubmissionToDS(): Promise<IDSResponse> {
    // const res = await Promise.resolve<IDSResponse>({
    //   transcription: 'asdaksfmnasdlkcfmnasdlfkasmfdlkasdf',
    //   confidence: 50,
    //   score: Math.floor(Math.random() * 40 + 10), // Rand 10-50
    //   rotation: 0,
    // });

    const res = await this.submitTextSubmissionToDSAPI({
      StoryId: 1,
      SubmissionID: 1,
      Pages: {
        1: {},
      },
    });

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
    } else if (subs.length === 1) {
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

      zip(userIds, rot1, rot2, rot3).forEach(([userId, ...subIds]) => {
        subIds.forEach((subId) => {
          response.push({ submissionId: subId, voterId: userId });
        });
      });
    }

    return response;
  }

  private async submitTextSubmissionToDSAPI(body: {
    SubmissionID: number;
    StoryId: number;
    Pages: Record<number, { filekey: string; Checksum: string }>;
  }): Promise<{
    SubmissionID: number;
    ModerationFlag: boolean;
    Confidence: number;
    SquadScore: number;
    Rotation: number;
    Transcription: string;
  }> {
    const { data } = await this.api.post(`/submission/text`, body);
    return data;
  }
}

serviceCollection.addTransient(DSService);
