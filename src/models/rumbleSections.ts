import { Service } from 'typedi';
import { Rumbles } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class RumbleSectionsModel extends BaseModel<
  Rumbles.rumble_sections.INewRumbleSections,
  Rumbles.rumble_sections.IRumbleSections
> {
  constructor() {
    super('rumble_sections');
  }

  public async updateEndTime(
    endTime: Date,
    sectionId: number,
    rumbleId: number
  ) {
    this.logger.debug(
      `Attempting to mark rumble (${rumbleId}) active for section ${sectionId}`
    );

    await this.db(this.tableName)
      .where({ sectionId, rumbleId })
      .update({ end_time: endTime, phase: 'WRITING' });

    this.logger.debug(
      `Successfully marked rumble (${rumbleId}) active for section ${sectionId}`
    );
  }
}
