/** URL Scope: /auth */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import cleverOAuthRoute__loader from './clever';

const route = Router();

export default function oAuthRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the OAuth routes onto the app at `/o`
  app.use('/o', route);

  // Add sub routes
  cleverOAuthRoute__loader(route);

  logger.debug('OAuth router loaded.');
}
