/** Current URL Scope: /rumble/students */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles, Submissions } from '../../../../interfaces';
import { RumbleService } from '../../../../services';
import { authHandler } from '../../../middlewares';

interface GetStudentSectionSubsQuery {
  sectionId: number;
}

/**
 * Get a list of submissions for a given student and section
 */
export default function rumbleStudentsRoute__getStudentSubs(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.get<
    API.WithId, // URL parameters
    Submissions.ISubItem[], // Response body
    API.WithAuth, // Request body
    GetStudentSectionSubsQuery // Query parameters
  >(
    '/:id/sections',
    authHandler({ roles: [Roles.RoleEnum.teacher, Roles.RoleEnum.admin] }),
    celebrate({
      [Segments.QUERY]: Joi.object<GetStudentSectionSubsQuery>({
        sectionId: Joi.number().required().min(1),
      }),
    }),
    async (req, res, next) => {
      try {
        const submissions = await rumbleServiceInstance.getSubsByStudentAndSection(
          req.params.id,
          req.query.sectionId
        );
        res.status(200).json(submissions);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
