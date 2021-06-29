import { Service, serviceCollection } from '../../deps';
import {
  INewRumbleSections,
  IRumbleSections,
} from '../interfaces/rumbleSections';
import BaseModel from './baseModel';

@Service()
export default class RumbleSectionsModel extends BaseModel<
  INewRumbleSections,
  IRumbleSections
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

    await this.db
      .table(this.tableName)
      .where('sectionId', sectionId)
      .where('rumbleId', rumbleId)
      .update({ end_time: endTime, phase: 'WRITING' })
      .execute();

    this.logger.debug(
      `Successfully marked rumble (${rumbleId}) active for section ${sectionId}`
    );
  }
}

serviceCollection.addTransient(RumbleSectionsModel);
