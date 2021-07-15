/** Current URL Scope: /rumble/rumbles/:id */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Rumbles } from '../../../../../interfaces';
import { RumbleService } from '../../../../../services';
import { authHandler } from '../../../../middlewares';

/**
 * Get the feedback for the given student's submission to the given rumble.
 */
export default function rumbleIdRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.get<
    API.WithId, // URL parameters
    Rumbles.IRumbleWithSectionInfo, // Response body
    never, // Request body
    never // Query parameters
  >('/', authHandler(), async (req, res, next) => {
    try {
      const rumble = await rumbleServiceInstance.getById(req.params.id);
      res.status(200).json(rumble);
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
