import { Service } from 'typedi';
import { Prompts } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class PromptQueueModel extends BaseModel<
  Prompts.queue.INewQueueItem,
  Prompts.queue.IQueueItem
> {
  constructor() {
    super('prompt_queue');
  }
}
