/** Current URL Scope: /prompts */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import activePromptRoute__get from './get';
import activePromptRoute__put from './put';

const route = Router({ mergeParams: true });

export default function activePromptRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the active prompt routes to `/active` at `/prompts`
  app.use('/active', route);

  // Add sub routes
  activePromptRoute__get(route);
  activePromptRoute__put(route);

  logger.debug('Active prompts router loaded.');
}
