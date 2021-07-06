/** URL Scope: /clash */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Clash } from '../../../interfaces';
import { ClashService } from '../../../services';

export default function clashRoute__getLeaderboard(route: Router) {
  const logger: Logger = Container.get('logger');
  const contestServiceInstance = Container.get(ClashService);

  route.get<
    never, // URL parameters
    Clash.ILeaderboardItem[], // Response body
    never, // Request body
    never // Query parameters
  >('/leaderboard', async (req, res, next) => {
    try {
      const leaderboard = await contestServiceInstance.getLeaderboard();
      console.log('leaderboard', leaderboard);
      res.status(200).json(leaderboard);
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
