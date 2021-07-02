import { DateTime } from 'luxon';
import { Service } from 'typedi';
import { Clash, Submissions } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class SubmissionModel extends BaseModel<
  Submissions.INewSubmission,
  Submissions.ISubmission
> {
  constructor() {
    super('submissions');
  }

  public async getSubsForStudentInSection(
    studentId: number,
    sectionId: number
  ) {
    try {
      this.logger.debug(
        `Getting subs for user ${studentId} in section ${sectionId}`
      );

      const subs = await this.db('submissions')
        .innerJoin('rumbles', 'rumbles.id', 'submissions.rumbleId')
        .innerJoin('rumble_sections', 'rumble_sections.rumbleId', 'rumbles.id')
        .where('rumble_sections.sectionId', sectionId)
        .andWhere('submissions.userId', studentId)
        .select<Submissions.ISubmission[]>('submissions.*');

      return subs;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getSubByStudentAndRumbleId(
    studentId: number,
    rumbleId: number
  ): Promise<Submissions.ISubmission | undefined> {
    try {
      const submission = await this.db('submissions')
        .where({ rumbleId, userId: studentId })
        .first();

      return submission;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getSubsForFeedback(
    studentId: number,
    rumbleId: number
  ): Promise<Submissions.ISubmission[]> {
    try {
      const subs = await this.db('rumble_feedback')
        .innerJoin(
          'submissions',
          'submissions.id',
          'rumble_feedback.submissionId'
        )
        .innerJoin('rumbles', 'rumbles.id', 'submissions.rumbleId')
        .where('rumbles.id', rumbleId)
        .andWhere('rumble_feedback.voterId', studentId)
        .select('submissions.*');

      return subs;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getFeedbackIDsByRumbleID(
    rumbleId: number
  ): Promise<{ submissionId: number; userId: number }[]> {
    try {
      const subs = await this.db<Submissions.ISubmission>('submissions')
        .where({ rumbleId })
        .select('id', 'userId');

      return subs.map(({ userId, id }) => ({ userId, submissionId: id }));
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getLeaderboardFrom(
    fromDate: Date | DateTime
  ): Promise<Clash.ILeaderboardItem[]> {
    let fromDateInISO: string;

    if (fromDate instanceof Date) {
      fromDateInISO = fromDate.toISOString();
    } else {
      fromDateInISO = fromDate.toISO();
    }
    const subs = await this.db('submissions')
      .innerJoin('users', 'users.id', 'submissions.userId')
      // This void fixes a linting error and does nothing else
      .avg<void>('submissions.score')
      .groupBy('users.id')
      .select('users.id', 'users.codename')
      .orderBy('score', 'desc')
      .limit(10)
      .where('submissions.created_at', '>=', fromDateInISO);

    return subs;
  }
}
