import { Service, serviceCollection } from '../../deps';
import { ISection } from '../interfaces/cleverSections';
import { INewStudent, IStudent } from '../interfaces/cleverStudents';
import BaseModel from './baseModel';

@Service()
export default class CleverStudentModel extends BaseModel<
  INewStudent,
  IStudent
> {
  constructor() {
    super('clever_students');
  }

  public async getSectionsById(studentId: number) {
    try {
      this.logger.debug(
        `Attempting to get sections for student with ID: ${studentId}`
      );

      const sections = ((await this.db
        .table('clever_sections')
        .innerJoin(
          'clever_students',
          'clever_sections.id',
          'clever_students.sectionId'
        )
        .innerJoin('users', 'clever_students.userId', 'users.id')
        .where('users.id', studentId)
        .select('clever_sections.*')
        .execute()) as unknown[]) as ISection[];

      return sections;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}

serviceCollection.addTransient(CleverStudentModel);
