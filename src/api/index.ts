import { Router } from 'express';
import { commonRoutes, contestRoutes, rumbleRoutes } from './routes';

export default function loadAppRoutes() {
  console.log('Loading routers...');
  const app = Router();

  commonRoutes.auth(app);
  commonRoutes.users(app);
  commonRoutes.submissions(app);
  commonRoutes.prompts(app);
  contestRoutes(app);
  rumbleRoutes(app);

  console.log('Routers loaded.');
  return app;
}
