/** Current URL Scope: /prompts */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Prompts, Roles } from '../../../../interfaces';
import { PromptModel } from '../../../../models';
import { authHandler } from '../../../middlewares';

export default function promptRoute__post(route: Router) {
  const logger: Logger = Container.get('logger');
  const promptModelInstance = Container.get(PromptModel);

  route.post<
    never, // URL parameters
    Prompts.IPrompt, // Response body
    API.WithAuth<Prompts.INewPrompt>, // Request body
    never // Query parameters
  >(
    '/',
    authHandler(),
    celebrate({
      [Segments.BODY]: Joi.object<Prompts.INewPrompt>({
        prompt: Joi.string().required(),
      }),
    }),
    async (req, res, next) => {
      try {
        // Check if the uploader is an admin
        const isAdmin = req.body.__user.roleId === Roles.RoleEnum.admin;

        const [newPrompt] = await promptModelInstance.add({
          prompt: req.body.prompt,
          // Instant approval for admins
          approved: isAdmin,
          creatorId: req.body.__user.id,
        });
        res.status(201).json(newPrompt);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
