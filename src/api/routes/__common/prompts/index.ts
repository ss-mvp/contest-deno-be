/** Current URL Scope: / */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import activePromptRoute__loader from './active';
import promptRoute__get from './get';
import promptIdRoute__loader from './id';
import promptRoute__post from './post';
import promptQueueRoute__loader from './queue';

const route = Router({ mergeParams: true });

export default function promptRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the Prompt routes onto the app at `/prompts`
  app.use('/prompts', route);

  // Add sub routers
  activePromptRoute__loader(route);
  promptQueueRoute__loader(route);
  promptIdRoute__loader(route);

  // Add all of the sub prompt routes onto the Prompts router
  promptRoute__get(route);
  promptRoute__post(route);

  logger.debug('Prompt router loaded.');
}
