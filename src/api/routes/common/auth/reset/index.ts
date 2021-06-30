/** URL Scope: /auth */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import authResetRoute__get from './get';
import authResetRoute__post from './post';

const route = Router();

export default function authResetRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the Reset routes onto the app at `/reset`
  app.use('/reset', route);

  // Add sub routes
  authResetRoute__get(route);
  authResetRoute__post(route);

  logger.debug('Reset router loaded.');
}
