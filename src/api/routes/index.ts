import express from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import commonRoutes__loader from './common';
import contestRoutes__loader from './contest';
import classroomRumbleRoute__loader from './rumble';

export default function apiRoute__loader() {
  // Get our configured logger instance from our Container layer
  const logger: Logger = Container.get('logger');

  // Initialize our Express server application
  const app = express();

  logger.debug('Express server created.');
  logger.debug('Loading routes...');

  commonRoutes__loader(app);
  contestRoutes__loader(app);
  classroomRumbleRoute__loader(app);

  logger.debug('Routes loaded.');

  return app;
}
