import { Router } from 'express';
import { commonRoutes } from './routes';

export default function loadAppRoutes() {
  console.log('Loading routers...');
  const app = Router();

  commonRoutes(app);
  // contestRoutes(app);
  // rumbleRoutes(app);

  console.log('Routers loaded.');
  return app;
}
