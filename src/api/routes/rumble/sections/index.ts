/** URL Scope: /rumble */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import rumbleSectionRoute__getStudent from './getStudents';
import rumbleSectionRoute__postNewStudent from './postNewStudent';

const route = Router({ mergeParams: true });

export default function rumbleSectionRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the router to the app at /sections
  app.use('/sections', route);

  // Add routes to the router
  rumbleSectionRoute__getStudent(route);
  rumbleSectionRoute__postNewStudent(route);

  logger.debug('Rumble sections route loaded.');
}
