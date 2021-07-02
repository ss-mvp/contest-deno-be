import { DateTime } from 'luxon';
import { Service } from 'typedi';
import { Prompts } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class PromptModel extends BaseModel<
  Prompts.INewPrompt,
  Prompts.IPrompt
> {
  constructor() {
    super('prompts');
  }

  public async getUpcoming(): Promise<Prompts.IPromptInQueue[]> {
    try {
      const prompts = await this.db('prompt_queue')
        .innerJoin('prompts', 'prompts.id', 'prompt_queue.promptId')
        .where('prompt_queue.starts_at', '>', DateTime.now().toISO())
        .orWhere('prompts.active', true)
        .limit(7)
        .select('prompts.*', 'prompt_queue.starts_at');

      return prompts;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
