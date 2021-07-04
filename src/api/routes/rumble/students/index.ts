/** URL Scope: /rumble */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

const route = Router();

export default function rumbleStudentsRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the router to the app at /students
  app.use('/students', route);

  // Add routes to the router

  logger.debug('Rumble students route loaded.');
}
