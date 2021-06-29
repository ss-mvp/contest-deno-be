import { Service, serviceCollection } from '../../deps';
import {
  INewPromptQueueItem,
  IPromptQueueItem,
} from '../interfaces/promptQueue';
import BaseModel from './baseModel';

@Service()
export default class PromptQueueModel extends BaseModel<
  INewPromptQueueItem,
  IPromptQueueItem
> {
  constructor() {
    super('prompt_queue');
  }
}

serviceCollection.addTransient(PromptQueueModel);
