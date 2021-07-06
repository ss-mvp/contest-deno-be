import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import clashRoute__getLeaderboard from './getLeaderboard';
import clashTopRoute__loader from './top';
import clashVotesRoute__loader from './votes';
import clashWinnerRoute__loader from './winner';

const route = Router({ mergeParams: true });

export default function clashRoutes__loader(app: Router) {
  const logger: Logger = Container.get('logger');
  logger.debug('Loading contest routers...');

  // Add the contest router to the app at /clash
  app.use('/clash', route);

  // Add sub routers to the contest router
  clashVotesRoute__loader(route);
  clashWinnerRoute__loader(route);
  clashTopRoute__loader(route);

  // Add routes
  clashRoute__getLeaderboard(route);

  logger.debug('Contest routers loaded.');
}
