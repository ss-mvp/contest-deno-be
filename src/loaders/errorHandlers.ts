import { CelebrateError, isCelebrateError } from 'celebrate';
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

  // Handle errors from the Celebrate validation middleware
  app.use(
    (err: CelebrateError, req: Request, res: Response, next: NextFunction) => {
      // If it's not a celebrate error, pass it to the next middleware
      if (!isCelebrateError(err)) return next(err);
      console.log('error handled');

      // Otherwise, handle the celebrate error here
      const response = {
        message: 'Invalid request data',
        errors: {} as Record<string, string[]>,
      };
      err.details.forEach((error, name) => {
        if (!response.errors[name]) response.errors[name] = [];
        if (!response.errors[name].includes(error.message)) {
          response.errors[name].push(error.message);
        }
        err.details.forEach((det) => {
          if (!response.errors[name].includes(det.message)) {
            response.errors[name].push(det.message);
          }
          det.details.forEach((inDet) => {
            if (!response.errors[name].includes(inDet.message)) {
              response.errors[name].push(inDet.message);
            }
          });
        });
      });

      res.status(400).json(response);
    }
  );

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
        logger.warn(`${err.message} - NEEDS CUSTOM ERROR HANDLING`);
      }
      next(err);
    }
  );

  // This is the final endpoint, which will handle error messages consistently for us
  app.use(
    // eslint-disable-next-line
    (err: IHTTPError, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || 500;
      const message = err.message || 'Something went wrong.';
      logger.debug(`[ERR${status}] - { error: '${message}' }`);
      res.status(status).json({ message });
    }
  );
}
