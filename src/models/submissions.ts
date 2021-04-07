import { Service, serviceCollection } from '../../deps.ts';
import { Sources } from '../interfaces/enumSources.ts';
import { INewSubmission, ISubmission } from '../interfaces/submissions.ts';
import BaseModel from './baseModel.ts';

@Service()
export default class SubmissionModel extends BaseModel<
  INewSubmission,
  ISubmission
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

      const subs = ((await this.db
        .table('submissions')
        .innerJoin('prompts', 'prompts.id', 'submissions.promptId')
        .innerJoin('rumbles', 'rumbles.promptId', 'prompts.id')
        .innerJoin('rumble_sections', 'rumble_sections.rumbleId', 'rumbles.id')
        .innerJoin(
          'clever_sections',
          'clever_sections.id',
          'rumble_sections.sectionId'
        )
        .where('submissions.userId', studentId)
        .where('clever_sections.id', sectionId)
        .where('submissions.sourceId', Sources.Rumble)
        .select('submissions.*')
        .execute()) as unknown[]) as ISubmission[];

      return subs;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getSubByStudentAndRumbleId(studentId: number, rumbleId: number) {
    try {
      const subs = ((await this.db
        .table('submissions')
        .innerJoin('prompts', 'prompts.id', 'submissions.promptId')
        .innerJoin('rumbles', 'rumbles.promptId', 'prompts.id')
        .where('rumbles.id', rumbleId)
        .where('submissions.userId', studentId)
        .select('submissions.*')
        .execute()) as unknown[]) as ISubmission[];
      return subs[0];
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getSubsForFeedback(
    studentId: number,
    rumbleId: number
  ): Promise<ISubmission[]> {
    try {
      const subs = ((await this.db
        .table('users')
        .innerJoin('rumble_feedback', 'rumble_feedback.voterId', 'users.id')
        .innerJoin(
          'submissions',
          'submissions.id',
          'rumble_feedback.submissionId'
        )
        .innerJoin('clever_students', 'clever_students.userId', 'users.id')
        .innerJoin(
          'clever_sections',
          'clever_sections.id',
          'clever_students.sectionId'
        )
        .innerJoin(
          'rumble_sections',
          'rumble_sections.sectionId',
          'clever_sections.id'
        )
        .innerJoin('rumbles', 'rumbles.id', 'rumble_sections.rumbleId')
        .select('submissions.*')
        .where('users.id', studentId)
        .where('rumbles.id', rumbleId)
        .execute()) as unknown) as ISubmission[];
      return subs;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}

serviceCollection.addTransient(SubmissionModel);
