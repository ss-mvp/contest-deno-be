/** Current URL Scope: /account */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

const route = Router();

export default function accountCodenameRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the Codename routes onto the app at `/codename`
  app.use('/codename', route);

  // Add sub routers

  // Add all of the sub account routes onto the Codename router

  logger.debug('Account codename router loaded.');
}
