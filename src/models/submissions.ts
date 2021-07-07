import { DateTime } from 'luxon';
import { Service } from 'typedi';
import { Clash, Flags, Submissions } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class SubmissionModel extends BaseModel<
  Submissions.INewSubmission,
  Submissions.ISubmission
> {
  constructor() {
    super('submissions');
  }

  public async getRecentForUser(
    userId: number,
    /** limit and offset can be specified for pagination */
    config?: { limit?: number; offset?: number }
  ) {
    const limit = config?.limit || 10; // Defaults to 10 if not set
    const offset = config?.offset || 0; // Defaults to 0 if not set
    const subs = await this.get(
      { userId },
      {
        limit,
        offset,
        orderBy: 'created_at',
        order: 'DESC',
      }
    );
    return subs;
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
      .avg<void>('submissions.score as score')
      .groupBy('users.id')
      .select('users.id', 'users.codename')
      .orderBy('score', 'desc')
      .limit(10)
      .where('submissions.created_at', '>=', fromDateInISO);

    return subs;
  }

  // Flag queries are on the submission model!

  public async addFlags(
    submissionFlags: Flags.INewSubFlagXref | Flags.INewSubFlagXref[]
  ): Promise<Flags.ISubFlagXref[]> {
    const flagIds = await this.db('submission_flags').insert(
      submissionFlags,
      '*'
    );
    return flagIds;
  }

  public async removeFlags(
    submissionId: number,
    ...flagIdsOrNames: number[]
  ): Promise<void> {
    // TODO test this query
    await this.db('submission_flags')
      .innerJoin('enum_flags', 'enum_flags.id', 'submission_flags.flagId')
      // If you pass the id of a flag, this will catch it
      .whereIn('submission_flags.flagId', flagIdsOrNames)
      // If you pass the name of a flag in, this will catch it
      .orWhereIn('enum_flags.flag', flagIdsOrNames)
      // And this makes sure we're only pulling for one submission
      .andWhere('submission_flags.submissionId', submissionId)
      .del();
  }

  public async getFlagsBySubId(submissionId: number): Promise<string[]> {
    const flags = await this.db('submission_flags')
      .innerJoin('enum_flags', 'enum_flags.id', 'submission_flags.flagId')
      .select('enum_flags.flag')
      .where('submission_flags.submissionId', submissionId);
    const parsedFlags = flags.map((flag) => flag.flag);
    return parsedFlags;
  }
}
