/** URL Scope: /submissions/:id/flags */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles } from '../../../../../../interfaces';
import { SubmissionModel } from '../../../../../../models';
import { authHandler } from '../../../../../middlewares';

interface SubmissionFlagDeleteParam {
  // An array of flag ids
  flagId: number;
}

/**
 * Adds a flag to a submission.
 */
export default function submissionFlagRoute__deleteById(route: Router) {
  const logger: Logger = Container.get('logger');
  const subModelInstance = Container.get(SubmissionModel);

  route.delete<
    API.WithId<SubmissionFlagDeleteParam>, // URL parameters
    never, // Response body
    never, // Request body
    never // Query parameters
  >(
    '/:flagId',
    authHandler({ roles: [Roles.RoleEnum.admin] }),
    async (req, res, next) => {
      try {
        await subModelInstance.removeFlags(req.params.id, req.params.flagId);
        res.status(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
