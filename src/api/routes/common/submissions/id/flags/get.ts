/** URL Scope: /submissions/:id/flags */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles } from '../../../../../../interfaces';
import { SubmissionService } from '../../../../../../services';
import { authHandler } from '../../../../../middlewares';

/**
 * Get an array of the flags for a submission.
 */
export default function submissionFlagRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const subServiceInstance = Container.get(SubmissionService);

  // TODO check the return type of this
  route.get<
    API.WithId, // URL parameters
    string[], // Response body
    never, // Request body
    never // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.teacher, Roles.RoleEnum.admin] }),
    async (req, res, next) => {
      try {
        const flags = await subServiceInstance.getFlagsBySubId(req.params.id);
        res.status(200).json(flags);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
