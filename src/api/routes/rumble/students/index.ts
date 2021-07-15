/** Current URL Scope: /rumble */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import rumbleStudentsRoute__getSections from './getSections';
import rumbleStudentsRoute__getStudentSubs from './getStudentSubs';

const route = Router({ mergeParams: true });

export default function rumbleStudentsRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the router to the app at /students
  app.use('/students', route);

  // Add routes to the router
  rumbleStudentsRoute__getSections(route);
  rumbleStudentsRoute__getStudentSubs(route);

  logger.debug('Rumble students route loaded.');
}
