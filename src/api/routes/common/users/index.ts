/** URL Scope: / */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import userRoute__delete from './delete';
import userRoute__get from './get';
import userRoute__getById from './getById';
import userRoute__getSubmissions from './getSubmissions';
import userRoute__head from './head';
import userRoute__post from './post';
import userRoute__put from './put';

const route = Router({ mergeParams: true });

export default function userRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add our router to the app at /users
  app.use('/users', route);

  // Add routes to our router
  userRoute__head(route);
  userRoute__get(route);
  userRoute__getById(route);
  userRoute__getSubmissions(route);
  userRoute__post(route);
  userRoute__put(route);
  userRoute__delete(route);

  logger.debug('User route loaded.');
}
