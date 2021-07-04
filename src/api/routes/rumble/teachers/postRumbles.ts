/** URL Scope: /rumble/teachers */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles, Rumbles } from '../../../../interfaces';
import { RumbleService } from '../../../../services';
import { authHandler } from '../../../middlewares';

interface PostNewRumbleBody {
  rumble: Rumbles.IRumblePostBody;
  sectionIds: number[];
}

/**
 * Adds a new rumble
 */
export default function rumbleTeachersRoute__postRumbles(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.get<
    API.WithId, // URL parameters
    Rumbles.IRumbleWithSectionInfo[], // Response body
    API.WithAuth<PostNewRumbleBody>, // Request body
    never // Query parameters
  >(
    '/:id/rumbles',
    authHandler({ roles: [Roles.RoleEnum.teacher, Roles.RoleEnum.admin] }),
    celebrate({
      [Segments.BODY]: Joi.object<PostNewRumbleBody>({
        rumble: Joi.object<Rumbles.IRumblePostBody>({
          numMinutes: Joi.number().required().min(1),
          promptId: Joi.number().required().min(1),
          start_time: Joi.date().optional(),
        }),
        sectionIds: Joi.array().min(1).items(Joi.number().min(1)),
      }),
    }),
    async (req, res) => {
      try {
        const rumble = await rumbleServiceInstance.createGameInstances({
          rumble: req.body.rumble,
          sectionIds: req.body.sectionIds,
        });
        res.status(201).json(rumble);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
