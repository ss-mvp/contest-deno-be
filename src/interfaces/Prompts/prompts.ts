import { IQueueItem } from './promptQueue';

/**
 * starts_at is a date string in the format `yyyy-mm-dd`
 */
export interface IPromptInQueue
  extends IPrompt,
    Pick<IQueueItem, 'starts_at'> {}
export const STARTS_AT_FORMAT = 'yyyy-MM-dd';

export interface IPrompt extends INewPrompt {
  id: number;
  active: boolean;
  approved: boolean;
}

export interface INewPrompt {
  prompt: string;
  approved?: boolean;
  creatorId?: number;
}
