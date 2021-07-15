/** Current URL Scope: /rumble/rumbles/:id */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Submissions } from '../../../../../interfaces';
import { RumbleService } from '../../../../../services';
import { authHandler } from '../../../../middlewares';

interface GetFeedbackAssignmentsQuery {
  studentId: number;
}

/**
 * Gets a list of the submissions that the given student must provide
 * feedback to for the given rumble. This populates the peer feedback
 * form on the frontend.
 */
export default function rumbleIdRoute__getFeedback(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.get<
    API.WithId, // URL parameters
    Submissions.ISubItem[], // Response body
    never, // Request body
    GetFeedbackAssignmentsQuery // Querp parameters
  >('/:rumbleId/feedback', authHandler(), async (req, res, next) => {
    try {
      const submissions = await rumbleServiceInstance.getSubsForFeedback(
        req.query.studentId,
        req.params.id
      );
      res.status(200).json(submissions);
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
