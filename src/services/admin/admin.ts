import { DateTime } from 'luxon';
import { Service } from 'typedi';
import { PromptModel, PromptQueueModel } from '../../models';
import { HTTPError } from '../../utils';
import BaseService from '../baseService';

@Service()
export default class AdminService extends BaseService {
  constructor(
    private promptModel: PromptModel,
    private promptQueue: PromptQueueModel
  ) {
    super();
  }

  public async updateActivePrompt() {
    try {
      const startsAt = DateTime.utc().toFormat('yyyy-mm-dd');
      const currentPrompt = await this.promptModel.get(
        { active: true },
        { first: true }
      );
      const { promptId: newId } = await this.promptQueue.get(
        { starts_at: startsAt },
        { first: true }
      );
      if (currentPrompt.id === newId) {
        throw HTTPError.create(409, 'Prompt is already up-to-date');
      }

      await this.db.transaction(async () => {
        await this.promptModel.update(newId, { active: true });
        await this.promptModel.update(currentPrompt.id, { active: false });
      });
      this.logger.debug('Successfully updated active prompt');
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
