import { Router } from 'express';
import leaderboard from './leaderboard';
import votes from './votes';

export default function contestRouteLoader(app: Router) {
  console.log('Loading contest routes...');
  const contestRouter = Router();
  app.use('/contest', contestRouter);

  votes(contestRouter);
  leaderboard(contestRouter);

  console.log('Contest routers loaded.');
}
