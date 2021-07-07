/** URL Scope: /submissions/id */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Submissions } from '../../../../../interfaces';
import { SubmissionService } from '../../../../../services';
import { authHandler } from '../../../../middlewares';

export default function submissionIdRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const subServiceInstance = Container.get(SubmissionService);

  route.get<
    API.WithId, // URL parameters
    Submissions.ISubItem, // Response body
    never, // Request body
    never // Query parameters
  >('/', authHandler(), async (req, res, next) => {
    try {
      const subs = await subServiceInstance.getById(req.params.id);
      res.status(200).json(subs);
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
