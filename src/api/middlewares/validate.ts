import {
  createError,
  log,
  NextFunction,
  Request,
  Response,
  Rule,
  serviceCollection,
  validate,
  ValidationRules,
} from '../../../deps.ts';

export default <ObjectInterface = undefined>(
  schema: IRulesFromType<ObjectInterface>,
  toValidate: 'query' | 'body' | 'params' = 'body'
) => async (req: Request, res: Response, next: NextFunction) => {
  const logger: log.Logger = serviceCollection.get('logger');
  try {
    logger.debug(`Validating ${toValidate} for endpoint: ${req.path}`);
    // Validate and pull errors
    const [passes, errors] = await validate(req[toValidate], schema);
    const errorFields = Object.keys(errors); // handle library bug edge cases

    if (passes) {
      logger.debug(`Validated ${toValidate} for endpoint: ${req.path}`);
      return next();
    } else {
      throw createError(
        400,
        `Invalid or missing fields in ${toValidate}: ${errorFields.join(', ')}`
      );
    }
  } catch (err) {
    logger.error(err);
    return next(err);
  }
};

type IRulesFromType<ObjectInterface> = {
  [ObjectKey in keyof ObjectInterface]?: Rule | Rule[];
} &
  ValidationRules;
