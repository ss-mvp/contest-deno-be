/** Current URL Scope: /account */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import accountCodenameRoute__get from './get';

const route = Router({ mergeParams: true });

export default function accountCodenameRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the Codename routes onto the app at `/codename`
  app.use('/codename', route);

  // Add routes onto the Codename router
  accountCodenameRoute__get(route);

  logger.debug('Account codename router loaded.');
}
