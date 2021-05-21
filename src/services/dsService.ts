import {
  Inject,
  log,
  PutObjectResponse,
  Service,
  serviceCollection
} from '../../deps.ts';
import { IDSResponse } from '../interfaces/submissions.ts';
import SubmissionModel from '../models/submissions.ts';
import RumbleService from './rumble.ts';
import SubmissionService from './submission.ts';

@Service()
export default class DSService {
  constructor(
    @Inject('logger') private logger: log.Logger,
    @Inject(SubmissionService) private subService: SubmissionService,
    @Inject(SubmissionModel) private subModel: SubmissionModel,
    @Inject(RumbleService) private rumbleService: RumbleService
  ) {}

  public async sendSubmissionToDS(
    s3Object: PutObjectResponse
  ): Promise<IDSResponse> {
    const res = await Promise.resolve<IDSResponse>({
      transcription: 'asdaksfmnasdlkcfmnasdlfkasmfdlkasdf',
      confidence: 50,
      score: Math.floor(Math.random() * 40 + 10), // Rand 10-50
      rotation: 0,
    });

    return res;
  }

  public async startFeedback(rumbleId: number): Promise<void> {
    // TODO implement DS scripts
    const subs = await this.
    try {
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  private generateFeedbackAssignments(
    req: {
      userId: number;
      submissionId: number;
    }[]
  ): blahres[] {
    const response: blahres[] = [];
    const userIds: number[] = [];
    const submissionIds: number[] = [];

    req.forEach((r) => {
      userIds.push(r.userId);
      submissionIds.push(r.submissionId);
    });

    // Edge cases to handle situations with < 4 submissions
    if (req.length === 2 || req.length === 3) {
      userIds.forEach((uId, i) => {
        submissionIds.forEach((sId, j) => {
          if (i !== j) response.push({ submissionId: sId, voterId: uId });
        });
      });
    } else if (req.length === 1) {
      // do nothing
    } else {
      // standard use case
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
}

function rotate<Type>(arr: Type[], by: number): Type[] {
  return [...arr.slice(by), ...arr.slice(0, by)];
}
const zip = <Type>(...arrs: Type[][]): Type[][] =>
  arrs.map((_, i) => arrs.map((arr) => arr[i]));

interface blahres {
  voterId: number;
  submissionId: number;
}

serviceCollection.addTransient(DSService);
