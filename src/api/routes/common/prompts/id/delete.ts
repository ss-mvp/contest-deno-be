/** Current URL Scope: /prompts/:id */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles } from '../../../../../interfaces';
import { PromptModel } from '../../../../../models';
import { authHandler } from '../../../../middlewares';

export default function promptIdRoute__delete(route: Router) {
  const logger: Logger = Container.get('logger');
  const promptModelInstance = Container.get(PromptModel);

  route.delete<
    API.WithId, // URL parameters
    never, // Response body
    never, // Request body
    never // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.admin] }),
    celebrate({
      [Segments.PARAMS]: Joi.object<API.WithId>({
        id: Joi.number().required().min(1),
      }),
    }),
    async (req, res, next) => {
      try {
        await promptModelInstance.delete(req.params.id);

        res.status(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
