import { Service } from 'typedi';
import { Clever } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class CleverTeacherModel extends BaseModel<
  Clever.teachers.INewTeacher,
  Clever.teachers.ITeacher
> {
  constructor() {
    super('clever_teachers');
  }

  public async getSectionsById(teacherId: number) {
    try {
      this.logger.debug(
        `Attempting to get sections for teacher with ID: ${teacherId}`
      );

      const sections = await this.db('clever_sections')
        .innerJoin(
          'clever_teachers',
          'clever_sections.id',
          'clever_teachers.sectionId'
        )
        .innerJoin('users', 'clever_teachers.userId', 'users.id')
        .where('users.id', teacherId)
        .select('clever_sections.*');

      return sections;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
