/** URL Scope: /rumble/rumbles */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import rumbleIdRoute__get from './get';
import rumbleIdRoute__getFeedback from './getFeedback';
import rumbleIdRoute__getStudents from './getStudents';
import rumbleIdRoute__getSubForStudent from './getSubForStudent';
import rumbleIdRoute__putStartFeedback from './putStartFeedback';
import rumbleIdRoute__putStartWriting from './putStartWriting';

const route = Router();

export default function rumbleIdRoute__loader(app: Router) {
  const logger: Logger = Container.get('logger');

  // Add the id router to the rumbles router at /:id
  app.use('/:id', route);

  // Add routes to the id router
  // TODO split these up into more sub routes maybe
  rumbleIdRoute__get(route);
  rumbleIdRoute__getStudents(route);
  rumbleIdRoute__putStartWriting(route);
  rumbleIdRoute__getSubForStudent(route);
  rumbleIdRoute__getFeedback(route);
  rumbleIdRoute__putStartFeedback(route);

  logger.debug('Rumbles route loaded.');
}
