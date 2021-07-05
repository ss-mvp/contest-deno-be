/** URL Scope: /clash */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import contestVotesRoute__post from './post';

const router = Router();

export default function clashVotesRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the routes at the /votes endpoint
  app.use('/votes', router);

  // Add on the voting routes at /votes
  contestVotesRoute__post(router);

  logger.debug('Votes router loaded.');
}
