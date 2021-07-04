/** URL Scope: /rumble/rumbles/:id */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Clever, Roles } from '../../../../../interfaces';
import { RumbleService } from '../../../../../services';
import { authHandler } from '../../../../middlewares';

/**
 * Get the students and their submission for the given rumble.
 */
export default function rumbleIdRoute__getStudents(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.get<
    API.WithId, // URL parameters
    Clever.students.IStudentWithSubmissions[], // Response body
    never, // Request body
    never // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.admin, Roles.RoleEnum.teacher] }),
    async (req, res) => {
      try {
        const students = await rumbleServiceInstance.getStudentsWithSubForRumble(
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
