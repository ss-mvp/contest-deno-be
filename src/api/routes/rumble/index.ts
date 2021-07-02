import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import data from './data';
import feedback from './feedback';
import rumbles from './rumbles';
import sections from './sections';
import students from './students';
import teachers from './teachers';

const router = Router();

export default function rumbleRoutes__loader(app: Router) {
  const logger: Logger = Container.get('logger');
  logger.debug('Loading rumble routers...');

  // Add the /rumble routes onto the application
  app.use('/rumble', router);

  // Load the rumble routes at /rumble
  teachers(router);
  students(router);
  sections(router);
  rumbles(router);
  data(router);
  feedback(router);

  logger.debug('Rumble routers loaded.');
}
