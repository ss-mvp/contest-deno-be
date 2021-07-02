/** URL Scope: /prompts */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import promptQueueRoute__get from './get';

const route = Router();

export default function promptQueueRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the route at `/queue`
  app.use('/queue', route);

  // Add sub routes
  promptQueueRoute__get(route);

  logger.debug('Prompt queue routes loaded.');
}
