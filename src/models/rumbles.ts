import { Service } from 'typedi';
import { Clever, Rumbles, Users } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class RumbleModel extends BaseModel<
  Rumbles.INewRumble,
  Rumbles.IRumble
> {
  constructor() {
    super('rumbles');
  }

  public async getActiveRumblesBySection(section: Clever.sections.ISection) {
    try {
      const rumbles = await this.db
        .table('rumbles')
        .innerJoin('rumble_sections', 'rumble_sections.rumbleId', 'rumbles.id')
        .innerJoin(
          'clever_sections',
          'clever_sections.id',
          'rumble_sections.sectionId'
        )
        .select(
          'rumbles.*',
          'rumble_sections.end_time',
          'rumble_sections.phase',
          'rumble_sections.start_time'
        )
        .where('clever_sections.id', section.id);

      return rumbles.map<Rumbles.IRumbleWithSectionInfo>((r) => ({
        ...r,
        sectionId: section.id,
        sectionName: section.name,
      }));
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getStudentsByRumbleId(rumbleId: number): Promise<Users.IUser[]> {
    try {
      const students = await this.db('rumbles')
        .innerJoin('rumble_sections', 'rumble_sections.rumbleId', 'rumbles.id')
        .innerJoin(
          'clever_sections',
          'clever_sections.id',
          'rumble_sections.sectionId'
        )
        .innerJoin(
          'clever_students',
          'clever_students.sectionId',
          'clever_sections.id'
        )
        .innerJoin('users', 'users.id', 'clever_students.userId')
        .where('rumbles.id', rumbleId)
        .select('users.*');

      return students;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getRumbleInfo(
    rumble: Rumbles.IRumble
  ): Promise<Rumbles.IRumbleWithSectionInfo> {
    try {
      const [rumbleInfo] = await this.db('rumble_sections')
        .innerJoin(
          'clever_sections',
          'clever_sections.id',
          'rumble_sections.sectionId'
        )
        .select(
          'rumble_sections.end_time',
          'rumble_sections.phase',
          'clever_sections.name',
          'rumble_sections.sectionId'
        )
        .where('rumbleId', rumble.id);

      return {
        ...rumble,
        sectionId: rumbleInfo.sectionId,
        sectionName: rumbleInfo.name,
        end_time: rumbleInfo.end_time,
        phase: rumbleInfo.phase,
      };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
