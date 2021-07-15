/** Current URL Scope: /prompts */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import promptIdRoute__delete from './delete';
import promptIdRoute__get from './get';
import promptIdRoute__put from './put';

const route = Router({ mergeParams: true });

export default function promptIdRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the router to the app at /:id
  app.use('/:id', route);

  // Add routes to the router
  promptIdRoute__get(route);
  promptIdRoute__put(route);
  promptIdRoute__delete(route);

  logger.debug('Prompt :id routes loaded.');
}
