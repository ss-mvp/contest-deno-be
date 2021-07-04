/** URL Scope: /rumble */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import rumbleIdRoute__loader from './id';

const route = Router();

export default function rumblesRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the rumbles router to the app at /rumbles
  app.use('/rumbles', route);

  // Add sub routers to the /:id router
  rumbleIdRoute__loader(route);

  logger.debug('Rumble  routes loaded.');
}
