import { Router } from 'express';
import authRoute from './auth';
import oAuthRoute from './oauth';
import promptRoute from './prompts';

export default function commonRouteLoader(app: Router) {
  console.log('Loading common routes...');

  authRoute(app);
  oAuthRoute(app);
  promptRoute(app);

  console.log('Common routes loaded.');
}
