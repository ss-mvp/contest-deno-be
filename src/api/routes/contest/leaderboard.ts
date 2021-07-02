import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { ContestService } from '../../../services';

const route = Router();

export default (app: Router) => {
  const logger: Logger = Container.get('logger');
  const contestServiceInstance = Container.get(ContestService);
  app.use(['/scoreboard', '/leaderboard'], route);

  // GET /
  route.get('/', async (req, res) => {
    try {
      const leaderboard = await contestServiceInstance.getLeaderboard();
      res.status(200).json(leaderboard);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  console.log('Leaderboard router loaded.');
};
