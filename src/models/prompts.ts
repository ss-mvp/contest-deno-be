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
        .limit(7)
        .where('prompt_queue.starts_at', '>', DateTime.now().toISO())
        .select('prompts.*', 'prompt_queue.starts_at');
      // Return early if we already have the active prompt
      if (prompts.some((p) => p.active)) return prompts;

      const [currentPrompt] = await this.db('prompt_queue')
        .innerJoin('prompts', 'prompts.id', 'prompt_queue.promptId')
        .where('prompts.active', true)
        .select('prompts.*', 'prompt_queue.starts_at');

      return [currentPrompt, ...prompts];
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
