import { IRouter, Router } from '../../../../deps';
import leaderboard from './leaderboard';
import votes from './votes';

export default (app: IRouter) => {
  console.log('Loading contest routers...');
  const contestRouter = Router();
  app.use('/contest', contestRouter);

  votes(contestRouter);
  leaderboard(contestRouter);

  console.log('Contest routers loaded.');
};
