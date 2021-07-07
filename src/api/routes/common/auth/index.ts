/** URL Scope: / */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import authActivationRoute__loader from './activation';
import authRoute__login from './login';
import oAuthRoute__loader from './o';
import authRoute__register from './register';
import authResetRoute__loader from './reset';

const route = Router({ mergeParams: true });

export default function authRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the Auth routes onto the app at `/auth`
  app.use('/auth', route);

  // Add sub routers
  oAuthRoute__loader(route);
  authActivationRoute__loader(route);
  authResetRoute__loader(route);

  // Add all of the sub auth routes onto the Auth router
  authRoute__register(route);
  authRoute__login(route);

  logger.debug('Auth router loaded.');
}
