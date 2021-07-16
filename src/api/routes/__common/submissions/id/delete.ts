/** Current URL Scope: /submissions/id */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles } from '../../../../../interfaces';
import { SubmissionModel } from '../../../../../models';
import { authHandler } from '../../../../middlewares';

export default function submissionIdRoute__delete(route: Router) {
  const logger: Logger = Container.get('logger');
  const subModelInstance = Container.get(SubmissionModel);

  route.delete<
    API.WithId, // URL parameters
    never, // Response body
    never, // Request body
    never // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.admin] }),
    async (req, res, next) => {
      try {
        await subModelInstance.delete(req.params.id);
        res.status(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
