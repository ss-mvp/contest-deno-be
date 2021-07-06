/** URL Scope: /rumble */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import rumbleTeachersRoute__getSections from './getSections';
import rumbleTeachersRoute__postRumbles from './postRumbles';
import rumbleTeachersRoute__postSections from './postSections';

const route = Router({ mergeParams: true });

export default function rumbleTeachersRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the router to the app at /teachers
  app.use('/teachers', route);

  // Add routes to the router
  rumbleTeachersRoute__getSections(route);
  rumbleTeachersRoute__postSections(route);
  rumbleTeachersRoute__postRumbles(route);

  logger.debug('Rumble teachers route loaded.');
}
