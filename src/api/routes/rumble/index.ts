/** Current URL Scope: / */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import rumbleFeedbackRoute__loader from './feedback';
import classroomRumbleRoute__get from './get';
import rumblesRoute__loader from './rumbles';
import rumbleSectionRoute__loader from './sections';
import rumbleStudentsRoute__loader from './students';
import rumbleTeachersRoute__loader from './teachers';

const route = Router({ mergeParams: true });

export default function classroomRumbleRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');
  logger.debug('Loading rumble routers...');

  // Add the rumble router at /rumble
  app.use('/rumble', route);

  // Add on the sub routes
  rumbleFeedbackRoute__loader(route);
  rumblesRoute__loader(route);
  rumbleSectionRoute__loader(route);
  rumbleTeachersRoute__loader(route);
  rumbleStudentsRoute__loader(route);

  // Add routes to the router
  classroomRumbleRoute__get(route);

  logger.debug('Rumble routers loaded.');
}
