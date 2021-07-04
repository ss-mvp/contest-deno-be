/** URL Scope: /contest */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import contestWinnerRoute__get from './get';

const route = Router();

export default function contestWinnerRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the router to the app at /winners
  app.use('/winners', route);

  // Add routes to the router
  contestWinnerRoute__get(route);

  logger.debug('Contest winner routes loaded.');
}
