/** URL Scope: /rumble/rumbles/:id */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Submissions } from '../../../../../interfaces';
import { RumbleService } from '../../../../../services';
import { authHandler } from '../../../../middlewares';

/**
 * Gets a student's submission for the specified rumble
 */
export default function rumbleIdRoute__getSubForStudent(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.get<
    API.WithId<'studentId'>, // URL parameters
    Submissions.ISubItem, // Response body
    never, // Request body
    never // Query parameters
  >('/students/:studentId', authHandler(), async (req, res, next) => {
    try {
      const sub = await rumbleServiceInstance.getSubForStudentByRumble(
        req.params.id,
        req.params.studentId
      );
      res.status(200).json(sub);
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
