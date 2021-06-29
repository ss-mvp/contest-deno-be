import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { HTTPError } from '../../utils';

export default function validateGenerator<ObjectInterface = undefined>(
  schema: IRulesFromType<ObjectInterface>,
  toValidate: 'query' | 'body' | 'params' = 'body'
) {
  return async function validateMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const logger: Logger = Container.get('logger');
    try {
      logger.debug(`Validating ${toValidate} for endpoint: ${req.path}`);
      // Validate and pull errors
      const [passes, errors] = await validate(req[toValidate], schema);
      const errorFields = Object.keys(errors); // handle library bug edge cases

      if (passes) {
        logger.debug(`Validated ${toValidate} for endpoint: ${req.path}`);
        return next();
      } else {
        throw HTTPError.create(
          400,
          `Invalid or missing fields in ${toValidate}: ${errorFields.join(
            ', '
          )}`
        );
      }
    } catch (err) {
      logger.error(err);
      return next(err);
    }
  };
}

type IRulesFromType<ObjectInterface> = {
  [ObjectKey in keyof ObjectInterface]?: Rule | Rule[];
} &
  ValidationRules;
