import { Service } from 'typedi';
import { Sections, Users } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class CleverSectionModel extends BaseModel<
  Sections.INewSection,
  Sections.ISection
> {
  constructor() {
    super('clever_sections');
  }

  public async getStudentsBySectionId(sectionId: number) {
    try {
      const students: Users.IUser[] = await this.db('clever_sections')
        .innerJoin(
          'clever_students',
          'clever_students.sectionId',
          'clever_sections.id'
        )
        .innerJoin('users', 'users.id', 'clever_students.userId')
        .where('clever_sections.id', sectionId)
        .select('users.*');

      return students;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
