/** Current URL Scope: / */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import accountCodenameRoute__loader from './codename';
import accountPasswordRoute__loader from './password';

const route = Router({ mergeParams: true });

export default function accountRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the Account routes onto the app at `/account`
  app.use('/account', route);

  // Add sub routers
  accountCodenameRoute__loader(route);
  accountPasswordRoute__loader(route);

  // Add all of the sub account routes onto the Account router

  logger.debug('Account router loaded.');
}
