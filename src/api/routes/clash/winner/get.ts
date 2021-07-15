/** Current URL Scope: /clash/winners */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Submissions } from '../../../../interfaces';
import { ClashService } from '../../../../services';

export default function contestWinnerRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const clashServiceInstance = Container.get(ClashService);

  route.get<
    never, // URL parameters
    Submissions.ISubItem, // Response body
    never, // Request body
    never // Query parameters
  >('/', async (req, res, next) => {
    try {
      const subs = await clashServiceInstance.getRecentWinner();
      res.status(200).json(subs);
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
