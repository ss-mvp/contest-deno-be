import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import contestRoute__getLeaderboard from './getLeaderboard';
import contestVotesRoute__loader from './votes';
import contestWinnerRoute__loader from './winner';

const route = Router();

export default function contestRoutes__loader(app: Router) {
  const logger: Logger = Container.get('logger');
  logger.debug('Loading contest routers...');

  // Add the contest router to the app at /contest
  app.use('/contest', route);

  // Add sub routers to the contest router
  contestVotesRoute__loader(route);
  contestWinnerRoute__loader(route);

  // Add routes
  contestRoute__getLeaderboard(route);

  logger.debug('Contest routers loaded.');
}
