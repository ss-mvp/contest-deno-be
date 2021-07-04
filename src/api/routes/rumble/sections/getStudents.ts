/** URL Scope: /rumble/sections */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Clever, Roles } from '../../../../interfaces';
import { RumbleService } from '../../../../services';
import { authHandler } from '../../../middlewares';

/**
 * Get a list of students and their submissions for a given section
 *
 * ! - very similar endpoint in rumbles
 */
export default function rumbleSectionRoute__getStudent(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.get<
    API.WithId, // URL parameters
    Clever.students.IStudentWithSubmissions[], // Response body
    never, // Request body
    never // Query parameters
  >(
    '/:id/students',
    authHandler({ roles: [Roles.RoleEnum.teacher, Roles.RoleEnum.admin] }),
    async (req, res) => {
      try {
        const students = await rumbleServiceInstance.getStudentsInSection(
          req.params.id
        );
        res.status(200).json(students);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
