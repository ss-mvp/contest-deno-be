/** Current URL Scope: / */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import submissionRoute__get from './get';
import submissionIdRoute__loader from './id';
import submissionRoute__post from './post';

const route = Router({ mergeParams: true });

export default function submissionRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the submission routes at `/submissions`
  app.use('/submissions', route);

  // Add the sub routers
  submissionIdRoute__loader(route);

  // Add on the routes at this path
  submissionRoute__get(route);
  submissionRoute__post(route);

  logger.debug('Submission router loaded.');
}
