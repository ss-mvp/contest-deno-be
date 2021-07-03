/** URL Scope /submissions */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import submissionIdRoute__delete from './delete';
import submissionFlagRoute__loader from './flags';
import submissionIdRoute__get from './get';
import submissionIdRoute__getFeedback from './getFeedback';

const route = Router();

export default function submissionIdRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the router to the app at /submissions/:id
  app.use('/:id', route);

  // Add sub routers to the router
  submissionFlagRoute__loader(route);

  // Add routes to the router
  submissionIdRoute__get(route);
  submissionIdRoute__delete(route);
  submissionIdRoute__getFeedback(route);

  logger.debug('Submission :id route loaded.');
}
