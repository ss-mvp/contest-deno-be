/** URL Scope: /prompts/active */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Prompts, Roles } from '../../../../../interfaces';
import { PromptModel } from '../../../../../models';
import { HTTPError } from '../../../../../utils';
import { authHandler } from '../../../../middlewares';

export default function activePromptRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const promptModelInstance = Container.get(PromptModel);

  route.get<
    never, // URL parameters
    Prompts.IPrompt, // Response body
    never, // Request body
    never // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.teacher, Roles.RoleEnum.admin] }),
    async (req, res, next) => {
      try {
        const [currentPrompt] = await promptModelInstance.get({ active: true });

        // Should throw an error, as this means an issue with our system
        if (!currentPrompt)
          throw HTTPError.create(404, 'No prompt currently set!');

        res.status(200).json(currentPrompt);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
