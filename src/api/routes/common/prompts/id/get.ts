/** URL Scope: /prompts/:id */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Prompts } from '../../../../../interfaces';
import { PromptModel } from '../../../../../models';
import { authHandler } from '../../../../middlewares';

export default function promptIdRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const promptModelInstance = Container.get(PromptModel);

  // Add the route onto the app at
  route.get<
    API.WithId, // URL parameters
    Prompts.IPrompt, // Response body
    never, // Request body
    never // Query parameters
  >(
    '/',
    authHandler(),
    celebrate({
      [Segments.PARAMS]: Joi.object<API.WithId>({
        id: Joi.number().required().min(1),
      }),
    }),
    async (req, res, next) => {
      try {
        const [prompt] = await promptModelInstance.get({
          id: req.params.id,
        });

        res.status(200).json(prompt);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
