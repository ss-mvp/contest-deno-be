/** URL Scope: /rumble */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

const route = Router();

export default function rumbleTeachersRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the router to the app at /teachers
  app.use('/teachers', route);

  // Add routes to the router

  logger.debug('Rumble teachers route loaded.');
}
