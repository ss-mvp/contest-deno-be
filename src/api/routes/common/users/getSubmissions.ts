/** URL Scope: /users */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Submissions } from '../../../../interfaces';
import { SubmissionService } from '../../../../services';
import { authHandler } from '../../../middlewares';

/**
 * Get submissions for a specific user by their id
 */
export default function userRoute__getSubmissions(route: Router) {
  const logger: Logger = Container.get('logger');
  const subServiceInstance = Container.get(SubmissionService);

  route.get<
    API.WithId, // URL parameters
    Submissions.ISubItem[], // Response body
    never, // Request body
    Pick<API.GetParams, 'limit' | 'offset'> // Query parameters
  >('/:id/submissions', authHandler(), async (req, res, next) => {
    try {
      const subs = await subServiceInstance.getUserSubs(req.params.id, {
        limit: req.query.limit || 6,
        offset: req.query.offset || 0,
      });
      res.status(200).json(subs);
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
