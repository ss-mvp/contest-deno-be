/** URL Scope: / */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

const route = Router();

export default function submissionRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the submission routes at `/submissions`
  app.use('/submissions', route);

  // Add the sub routers

  // Add on the routes at this path

  logger.debug('Submission router loaded.');
}
