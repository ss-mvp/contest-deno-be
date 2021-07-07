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
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // If it's not a celebrate error, pass it to the next middleware
    if (!isCelebrateError(err)) return next(err);

    // Otherwise, handle the celebrate error here
    const response = {
      message: 'Invalid request data',
      errors: {} as Record<string, Record<'errors' | 'fields', string[]>>,
    };
    function isJoiErr(e: unknown): e is CelebrateError {
      return !!(e as { isJoi: boolean }).isJoi || isCelebrateError(e);
    }
    function parseError(error: Error, name: string) {
      if (!isJoiErr(error)) return;
      if (!response.errors[name])
        response.errors[name] = { errors: [], fields: [] };
      error.details.forEach((detail) => {
        if (!response.errors[name].errors.includes(detail.message)) {
          response.errors[name].errors.push(detail.message);
        }
        /** A function to help with the bad typings from Joi/Celebrate */
        function hasLabel(det: unknown): det is { context: { label: string } } {
          const detAs = det as { context: { label: string } };
          return detAs.context && typeof detAs.context.label === 'string';
        }
        if (
          hasLabel(detail) &&
          !response.errors[name].fields.includes(detail.context.label)
        ) {
          response.errors[name].fields.push(detail.context.label);
        }
      });
    }
    err.details.forEach(parseError);
    console.log('joi err', response);
    res.status(400).json(response);
  });

  // Parsing DB Errors/Catching Unhandled Errors
  app.use(
    (err: IHTTPError, req: Request, res: Response, next: NextFunction) => {
      function getErrorField(dbError: string) {
        const DB_ERR_REGEX = /[\\"]+.+[a-zA-Z]+_(.*?)_[a-zA-Z]+["\\]+/gm;
        return DB_ERR_REGEX.exec(dbError)?.[1];
      }
      logger.debug(`${err.status} ${err.message}`);
      // Test for various error cases that we're manually catching at the end here
      if (err.message.includes('violates unique constraint')) {
        const error = err.message.split(' - ')[1];
        return next(
          HTTPError.create(409, {
            message: 'Could not create duplicate',
            error,
            field: getErrorField(error),
          })
        );
      } else if (err.message.includes('violates foreign key constraint')) {
        return next(
          HTTPError.create(409, {
            message: 'Invalid foreign key',
            error: err.message,
          })
        );
      } else if (err.message.includes('invalid input syntax')) {
        return next(
          HTTPError.create(400, {
            message: 'Invalid data provided',
            error: err.message,
          })
        );
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
      console.log('error handling', err);
      const status = err.status || 500;
      const message =
        err.response?.message || err.message || 'Something went wrong.';
      const response = Object.assign(err?.response || {}, { message });
      logger.debug(`[${status}] ${err.message}`);
      res.status(status).json(response);
    }
  );
}
