import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import accountRoute__loader from './account';
import authRoute__loader from './auth';
import promptRoute__loader from './prompts';
import submissionRoute__loader from './submissions';
import userRoute__loader from './users';

export default function commonRoutes__loader(app: Router) {
  const logger: Logger = Container.get('logger');
  logger.debug('Loading common routers...');

  accountRoute__loader(app);
  authRoute__loader(app);
  promptRoute__loader(app);
  submissionRoute__loader(app);
  userRoute__loader(app);

  logger.debug('Common routers loaded.');
}
