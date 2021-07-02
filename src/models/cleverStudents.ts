import { Service } from 'typedi';
import { Clever, Sections } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class CleverStudentModel extends BaseModel<
  Clever.students.INewStudent,
  Clever.students.IStudent
> {
  constructor() {
    super('clever_students');
  }

  /**
   * Get all of the sections for a student by passing in the student ID.
   * @param studentId the unique id of the student (from the users table)
   */
  public async getSectionsById(studentId: number) {
    try {
      this.logger.debug(
        `Attempting to get sections for student with ID: ${studentId}`
      );

      const sections: Sections.ISection[] = await this.db('clever_sections')
        .innerJoin(
          'clever_students',
          'clever_sections.id',
          'clever_students.sectionId'
        )
        .innerJoin('users', 'clever_students.userId', 'users.id')
        .where('users.id', studentId)
        .select('clever_sections.*');

      return sections;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
