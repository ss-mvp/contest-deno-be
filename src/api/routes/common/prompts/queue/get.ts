/** Current URL Scope: /prompts/queue */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Prompts } from '../../../../../interfaces';
import { PromptModel } from '../../../../../models';

/**
 * This route triggers the event that increments the currently active
 * prompt in the database to the next day. It's admin-only, takes no
 * input, and sends no output (aside from errors).
 */
export default function promptQueueRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const promptModelInstance = Container.get(PromptModel);

  route.get<
    never, // URL parameters
    Prompts.IPromptInQueue[], // Response body
    never, // Request body
    never // Query parameters
  >('/', async (req, res, next) => {
    try {
      const promptQueue = await promptModelInstance.getUpcoming();
      // Returns an array of prompts that include a `starts_at` date field
      res.status(200).json(promptQueue);
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
