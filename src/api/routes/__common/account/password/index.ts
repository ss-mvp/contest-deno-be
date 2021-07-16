/** Current URL Scope: /account */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import accountPasswordRoute__get from './get';
import accountPasswordRoute__post from './post';

const route = Router({ mergeParams: true });

export default function accountPasswordRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the Password routes onto the app at `/password`
  app.use('/password', route);

  // Add the routes onto the Password router
  accountPasswordRoute__get(route);
  accountPasswordRoute__post(route);

  logger.debug('Account password router loaded.');
}
