import { Service } from 'typedi';
import { ISection } from '../interfaces/Clever/sections';
import { INewTeacher, ITeacher } from '../interfaces/Clever/teachers';
import BaseModel from './baseModel';

@Service()
export default class CleverTeacherModel extends BaseModel<
  INewTeacher,
  ITeacher
> {
  constructor() {
    super('clever_teachers');
  }

  public async getSectionsById(teacherId: number) {
    try {
      this.logger.debug(
        `Attempting to get sections for teacher with ID: ${teacherId}`
      );

      const sections = ((await this.db
        .table('clever_sections')
        .innerJoin(
          'clever_teachers',
          'clever_sections.id',
          'clever_teachers.sectionId'
        )
        .innerJoin('users', 'clever_teachers.userId', 'users.id')
        .where('users.id', teacherId)
        .select('clever_sections.*')
        .execute()) as unknown[]) as ISection[];

      return sections;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
