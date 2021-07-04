/** URL Scope: /auth/o */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import cleverOAuthRoute__get from './get';
import cleverOAuthRoute__getButton from './getButton';
import cleverOAuthRoute__postMerge from './postMerge';
import cleverOAuthRoute__postSignup from './postSignup';

const route = Router();

export default function cleverOAuthRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the Clever routes onto the app at `/clever`
  app.use('/clever', route);

  // Add sub routes to /clever
  cleverOAuthRoute__get(route);
  cleverOAuthRoute__getButton(route);
  cleverOAuthRoute__postSignup(route);
  cleverOAuthRoute__postMerge(route);

  logger.debug('Clever router loaded.');
}
