/** Current URL Scope: /rumble */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import rumbleFeedbackRoute__get from './get';
import rumbleFeedbackRoute__getComplete from './getComplete';
import rumbleFeedbackRoute__put from './put';

const route = Router({ mergeParams: true });

export default function rumbleFeedbackRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the router to the app at /feedback
  app.use('/feedback', route);

  // Add routes to the router
  rumbleFeedbackRoute__get(route);
  rumbleFeedbackRoute__put(route);
  rumbleFeedbackRoute__getComplete(route);

  logger.debug('Rumble feedback route loaded.');
}
