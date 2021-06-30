import { Service } from 'typedi';
import { Sources, Submissions } from '../interfaces';
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
        .innerJoin('prompts', 'prompts.id', 'submissions.promptId')
        .innerJoin('rumbles', 'rumbles.promptId', 'prompts.id')
        .innerJoin('rumble_sections', 'rumble_sections.rumbleId', 'rumbles.id')
        .innerJoin(
          'clever_sections',
          'clever_sections.id',
          'rumble_sections.sectionId'
        )
        .where('submissions.userId', studentId)
        .andWhere('clever_sections.id', sectionId)
        .andWhere('submissions.sourceId', Sources.SourceEnum.Rumble)
        .select('submissions.*');

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
        .where({
          rumbleId,
          userId: studentId,
        })
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
        .innerJoin('prompts', 'prompts.id', 'submissions.promptId')
        .innerJoin('rumbles', 'rumbles.promptId', 'prompts.id')
        .where('rumble_feedback.voterId', studentId)
        .andWhere('rumbles.id', rumbleId)
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
}
