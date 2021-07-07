/** URL Scope: /rumble/teachers */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles, Sections } from '../../../../interfaces';
import { RumbleService } from '../../../../services';
import { authHandler } from '../../../middlewares';

/**
 * Adds a new section
 */
export default function rumbleTeachersRoute__postSections(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.get<
    API.WithId, // URL parameters
    Sections.ISection, // Response body
    API.WithAuth<Sections.ISectionPostBody>, // Request body
    never // Query parameters
  >(
    '/:id/sections',
    authHandler({ roles: [Roles.RoleEnum.teacher, Roles.RoleEnum.admin] }),
    celebrate({
      [Segments.BODY]: Joi.object<Sections.ISectionPostBody>({
        name: Joi.string().required().min(1),
      }),
    }),
    async (req, res, next) => {
      try {
        Reflect.deleteProperty(req.body, '__user');
        const newSection = await rumbleServiceInstance.createSection(
          req.body,
          req.params.id
        );
        res.status(201).json(newSection);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
