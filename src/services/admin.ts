import {
  createError,
  Inject,
  moment,
  Service,
  serviceCollection,
} from '../../deps';
import PromptQueueModel from '../models/promptQueue';
import PromptModel from '../models/prompts';
import BaseService from './baseService';

@Service()
export default class AdminService extends BaseService {
  constructor(
    @Inject(PromptModel) private promptModel: PromptModel,
    @Inject(PromptQueueModel) private promptQueue: PromptQueueModel
  ) {
    super();
  }

  public async updateActivePrompt() {
    try {
      const startsAt = (moment.utc().format('YYYY-MM-DD') as unknown) as Date;
      const currentPrompt = await this.promptModel.get(
        { active: true },
        { first: true }
      );
      const { promptId: newId } = await this.promptQueue.get(
        { starts_at: startsAt },
        { first: true }
      );
      if (currentPrompt.id === newId) {
        throw createError(409, 'Prompt is already up-to-date');
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

serviceCollection.addTransient(AdminService);
