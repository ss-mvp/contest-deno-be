/** URL Scope: /submissions */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Submissions } from '../../../../interfaces';
import { SubmissionService } from '../../../../services';
import { parseGetQuery } from '../../../../utils/parsers';
import { authHandler } from '../../../middlewares';

interface GetSubmissionQuery {
  sourceId?: number;
  tsrcId?: number;
  transcriptionSourceId?: number;
}

/**
 * Gets a list of submissions based on pagination parameters.
 */
export default function submissionRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const subServiceInstance = Container.get(SubmissionService);

  route.get<
    never, // URL parameters
    Submissions.ISubItem | Submissions.ISubItem[], // Response body
    never, // Request body
    API.GetParams<GetSubmissionQuery> // Query parameters
  >('/', authHandler(), async (req, res, next) => {
    try {
      // Parse the get query parameters from our request object for our function
      const getOptions = parseGetQuery(req.query);

      const subs = await subServiceInstance.get(getOptions);

      res.status(200).json(subs);
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
