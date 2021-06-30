import { Service } from 'typedi';
import { Clever } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class CleverStudentModel extends BaseModel<
  Clever.students.INewStudent,
  Clever.students.IStudent
> {
  constructor() {
    super('clever_students');
  }

  public async getSectionsById(studentId: number) {
    try {
      this.logger.debug(
        `Attempting to get sections for student with ID: ${studentId}`
      );

      const sections = await this.db('clever_sections')
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
