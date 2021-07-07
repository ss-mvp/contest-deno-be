/** URL Scope: /prompts/:id */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Prompts, Roles } from '../../../../../interfaces';
import { PromptModel } from '../../../../../models';
import { authHandler } from '../../../../middlewares';

export default function promptIdRoute__put(route: Router) {
  const logger: Logger = Container.get('logger');
  const promptModelInstance = Container.get(PromptModel);

  route.put<
    API.WithId, // URL parameters
    Prompts.IPrompt, // Response body
    API.WithAuth<Prompts.IPrompt>, // Request body
    never // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.admin] }),
    celebrate({
      [Segments.PARAMS]: Joi.object<API.WithId>({
        id: Joi.number().required().min(1),
      }),
      [Segments.BODY]: Joi.object<Prompts.IPrompt>({
        active: Joi.boolean().optional(),
        prompt: Joi.string().optional().min(10),
        approved: Joi.boolean().optional(),
      }),
    }),
    async (req, res, next) => {
      try {
        // Only add in the properties that have been set
        // Make sure we don't send whole body, as it will try to add the `__user`
        // from the authHandler into the table
        await promptModelInstance.update(req.params.id, {
          ...(req.body.active && { active: req.body.active }),
          ...(req.body.approved && { approved: req.body.approved }),
          ...(req.body.prompt && { prompt: req.body.prompt }),
        });

        res.status(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
