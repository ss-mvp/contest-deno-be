/** URL Scope /submissions/:id */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import submissionFlagRoute__deleteById from './delete';
import submissionFlagRoute__get from './get';
import submissionFlagRoute__post from './post';

const route = Router();

export default function submissionFlagRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the router to the app at /submissions/:id/flags
  app.use('/flags', route);

  // Add routes to the router
  submissionFlagRoute__get(route);
  submissionFlagRoute__post(route);
  submissionFlagRoute__deleteById(route);

  logger.debug('Submission flags route loaded.');
}
