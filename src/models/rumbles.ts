import { Service, serviceCollection } from '../../deps.ts';
import { ISection } from '../interfaces/cleverSections.ts';
import { IStudentWithSubmissions } from '../interfaces/cleverStudents.ts';
import {
  INewRumble,
  IRumble,
  IRumbleWithSectionInfo,
} from '../interfaces/rumbles.ts';
import BaseModel from './baseModel.ts';

@Service()
export default class RumbleModel extends BaseModel<INewRumble, IRumble> {
  constructor() {
    super('rumbles');
  }

  public async getActiveRumblesBySection(section: ISection) {
    try {
      const rumbles = ((await this.db
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
          'rumble_sections.phase'
        )
        .where('clever_sections.id', section.id)
        .execute()) as unknown[]) as IRumble[];

      // TODO put the WHOLE section on the rumble instead of this info piece
      return rumbles.map<IRumbleWithSectionInfo>((r) => ({
        ...r,
        sectionId: section.id,
        sectionName: section.name,
      }));
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getStudentsByRumbleId(rumbleId: number) {
    try {
      const students = ((await this.db
        .table('rumbles')
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
        .select('users.*')
        .execute()) as unknown[]) as IStudentWithSubmissions[];

      return students;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getRumbleInfo(rumble: IRumble): Promise<IRumbleWithSectionInfo> {
    try {
      const [rumbleInfo] = ((await this.db
        .table('rumble_sections')
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
        .where('rumbleId', rumble.id)
        .execute()) as unknown) as (Pick<
        IRumbleWithSectionInfo,
        'phase' | 'end_time' | 'sectionId'
      > & { name: string })[];

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

serviceCollection.addTransient(RumbleModel);
