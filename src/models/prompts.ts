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

  public async getNext(): Promise<Prompts.IPromptInQueue> {
    try {
      // TODO
      /**
       * we can change this so that we're checking based on the scheduled time
       * vs current time and running either query depending on the contest phase
       * rather than running one, checking it, and potentially running another
       */
      const activePrompt = await this.db('prompts')
        .innerJoin('prompt_queue', 'prompt_queue.promptId', 'prompts.id')
        .where('prompts.active', true)
        .select('prompts.*', 'prompt_queue.starts_at')
        .first<Prompts.IPromptInQueue>();

      const now = DateTime.utc();
      const activeStartTime = DateTime.fromFormat(
        activePrompt.starts_at,
        Prompts.STARTS_AT_FORMAT
      );

      if (activeStartTime.day === now.day) {
        return activePrompt;
      } else {
        // Otherwise, we get the NEXT prompt in the queue

        const tomorrowsPrompt = await this.db('prompts')
          .innerJoin('prompt_queue', 'prompt_queue.promptId', 'prompts.id')
          .where('prompt_queue.starts_at', now.plus({ day: 1 }).toISO())
          .select('prompts.*', 'prompt_queue.starts_at')
          .first<Prompts.IPromptInQueue>();

        return tomorrowsPrompt;
      }
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
