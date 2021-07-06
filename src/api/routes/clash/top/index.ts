/** URL Scope: /clash */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import contestTopRoute__get from './get';
import contestTopRoute__getAdmin from './getAdmin';
import contestTopRoute__post from './post';

const route = Router({ mergeParams: true });

export default function clashTopRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the router onto the app at /top
  app.use('/top', route);

  // Add routes to the router
  contestTopRoute__get(route);
  contestTopRoute__getAdmin(route);
  contestTopRoute__post(route);

  logger.debug('Contest top routes loaded.');
}
