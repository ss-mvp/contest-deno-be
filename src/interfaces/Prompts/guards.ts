import { IPromptInQueue } from './prompts';

export function isInQueue(prompt: unknown): prompt is IPromptInQueue {
  return !!(prompt as IPromptInQueue).starts_at;
}
