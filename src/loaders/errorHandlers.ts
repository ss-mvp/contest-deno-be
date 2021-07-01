import { Express, NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { HTTPError } from '../utils';
import { IHTTPError } from '../utils/HTTPError';

export default function errorHandler__routes(app: Express) {
  const logger: Logger = Container.get('logger');

  // Invalid Route fallback
  // If no other endpoint is hit, the request will fall back to this one
  app.use((req, res, next) => {
    next(HTTPError.create(404, 'Route not found'));
  });

  // Parsing DB Errors/Catching Unhandled Errors
  app.use(
    (err: IHTTPError, req: Request, res: Response, next: NextFunction) => {
      logger.debug(`${err.status} ${err.message}`);
      // Test for various error cases that we're manually catching at the end here
      if (err.message.includes('violates unique constraint')) {
        return next(HTTPError.create(409, 'Could not create duplicate'));
      } else if (err.message.includes('violates foreign key constraint')) {
        return next(HTTPError.create(409, 'Invalid foreign key'));
      } else if (err.message.includes('invalid input syntax')) {
        return next(HTTPError.create(400, 'Invalid data provided'));
      } else if (!err.status || err.status === 500) {
        logger.warning(`${err.message} - NEEDS CUSTOM ERROR HANDLING`);
      }
      next(err);
    }
  );

  // This is the final endpoint, which will handle error messages consistently for us
  app.use(
    // eslint-disable-next-line
    (err: IHTTPError, req: Request, res: Response, next: NextFunction) => {
      logger.debug(`${err.status} - { error: '${err.message}' }`);
      res
        .status(err.status || 500)
        .json({ message: err.message || 'Something went wrong.' });
    }
  );
}
