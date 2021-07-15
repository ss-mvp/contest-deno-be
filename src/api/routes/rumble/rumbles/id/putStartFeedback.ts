/** Current URL Scope: /rumble/rumbles/:id */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API } from '../../../../../interfaces';
import { RumbleService } from '../../../../../services';
import { authHandler } from '../../../../middlewares';

/**
 * Get the feedback for the given student's submission to the given rumble.
 */
export default function rumbleIdRoute__putStartFeedback(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.get<
    API.WithId, // URL parameters
    never, // Response body
    never, // Request body
    never // Query parameters
  >('/feedback/start', authHandler(), async (req, res, next) => {
    try {
      await rumbleServiceInstance.startFeedback(req.params.id);
      res.status(204).end();
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
