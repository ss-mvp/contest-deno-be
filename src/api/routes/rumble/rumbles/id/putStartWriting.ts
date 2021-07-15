/** Current URL Scope: /rumble/rumbles/:id */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles } from '../../../../../interfaces';
import { RumbleService } from '../../../../../services';
import { authHandler } from '../../../../middlewares';

/**
 * Starts the rumble and returns the new end time
 */
export default function rumbleIdRoute__putStartWriting(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.put<
    API.WithId<'sectionId'>, // URL parameters
    string, // Response body
    never, // Request body
    never // Query parameters
  >(
    '/section/:sectionId/start',
    authHandler({ roles: [Roles.RoleEnum.admin, Roles.RoleEnum.teacher] }),
    async (req, res, next) => {
      try {
        const endTime = await rumbleServiceInstance.startRumble(
          req.params.sectionId,
          req.params.id
        );
        res.status(201).json(endTime);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
