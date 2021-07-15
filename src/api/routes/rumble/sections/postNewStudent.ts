/** Current URL Scope: /rumble/sections */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles, Sections } from '../../../../interfaces';
import { RumbleService } from '../../../../services';
import { authHandler } from '../../../middlewares';

interface INewStudentBody {
  joinCode: string;
}

/**
 * Add a student to the given section
 */
export default function rumbleSectionRoute__postNewStudent(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.post<
    API.WithId<'studentId'>, // URL parameters
    Sections.ISectionWithRumbles, // Response body
    API.WithAuth<INewStudentBody>, // Request body
    never // Query parameters
  >(
    '/:id/students/:studentId',
    celebrate({
      [Segments.BODY]: Joi.object<INewStudentBody>({
        joinCode: Joi.string().required(),
      }),
    }),
    authHandler({ roles: [Roles.RoleEnum.teacher, Roles.RoleEnum.admin] }),
    async (req, res, next) => {
      try {
        const section = await rumbleServiceInstance.addChildToSection(
          req.body.joinCode,
          req.params.id,
          req.params.studentId
        );

        res.status(201).json(section);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
