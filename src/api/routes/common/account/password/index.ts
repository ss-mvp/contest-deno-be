/** Current URL Scope: /account */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

const route = Router();

export default function accountPasswordRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the Password routes onto the app at `/password`
  app.use('/password', route);

  // Add sub routers

  // Add all of the sub account routes onto the Password router

  logger.debug('Account password router loaded.');
}
