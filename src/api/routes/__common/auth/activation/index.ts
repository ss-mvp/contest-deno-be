/** Current URL Scope: /auth */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import authActivationRoute__get from './get';
import authActivationRoute__post from './post';
import authActivationRoute__put from './put';

const route = Router({ mergeParams: true });

export default function authActivationRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the activation routes onto the app at `/activation`
  app.use('/activation', route);

  // Add sub routes
  authActivationRoute__get(route);
  authActivationRoute__put(route);
  authActivationRoute__post(route);

  logger.debug('Activation router loaded.');
}
