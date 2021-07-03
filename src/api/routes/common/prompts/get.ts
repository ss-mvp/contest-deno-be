/** URL Scope: /prompts */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Prompts, Roles } from '../../../../interfaces';
import { PromptModel } from '../../../../models';
import { authHandler } from '../../../middlewares';

export default function promptRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const promptModelInstance = Container.get(PromptModel);

  route.get<
    never, // URL parameters
    Prompts.IPrompt | Prompts.IPrompt[], // Response body
    never, // Request body
    API.GetParams // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.teacher, Roles.RoleEnum.admin] }),
    async (req, res, next) => {
      try {
        const prompts = await promptModelInstance.get(undefined, {
          limit: req.query.limit || 10,
          offset: req.query.offset || 0,
          orderBy: req.query.orderBy || 'id',
          order: (req.query.order as 'ASC' | 'DESC') || 'ASC',
          first: req.query.first === 'true',
        });

        res.status(200).json(prompts);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
