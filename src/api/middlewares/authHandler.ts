import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Container from 'typedi';
import { Logger } from 'winston';
import env from '../../config/env';
import { Roles } from '../../interfaces/roles';
import UserModel from '../../models/users';
import { HTTPError } from '../../utils';

/**
 * Defaults to requiring any authenticated user.
 * Adds to body: { user: IUser };
 */
export default function authHandlerGenerator(config?: IAuthHandlerConfig) {
  return async function authHandlerMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // Set defaults for these config values
    const roles = config?.roles ?? [1, 2, 3];
    const authRequired = config?.authRequired ?? true;
    const validationRequired = config?.validationRequired ?? false;

    const logger: Logger = Container.get('logger');
    const token = req.get('Authorization');

    if (!token || token === 'null') {
      // If no token, check if auth is even required...
      if (authRequired) throw HTTPError.create(401, 'You must be logged in');
      // If it's not required, this is like the voting route, where
      // the token is optional and you can continue without it
      else return next();
    } else {
      // If it's there, we'll try to
      try {
        logger.debug('Attempting to verify token');
        const decodedJWT = jwt.verify(token, env.JWT.SECRET);

        logger.debug('Checking token expiration');
        if (!exp || exp < Date.now()) {
          // If token is expired, let them know
          throw HTTPError.create(401, 'Token is expired');
        } else if (!id) {
          // If token is formatted incorrectly
          throw HTTPError.create(401, 'Invalid token body');
        } else {
          logger.debug(
            `Successfully authenticated, authorizing for roles: \
            ${roles.join(', ')}`
          );
          // Get an instance of the UserModel if we need to role check
          const userModelInstance = Container.get(UserModel);
          const [user] = await userModelInstance.get({ id: parseInt(id, 10) });
          if (user.roleId !== Roles.admin && !roles.includes(user.roleId)) {
            throw HTTPError.create(401, 'Not authorized (Access Restricted)');
          } else if (validationRequired && !user.isValidated) {
            throw HTTPError.create(401, 'Account must be validated');
          }

          // Add the user info to the req body if all goes well
          // But remove unecessary fields
          Reflect.deleteProperty(user, 'password');
          Reflect.deleteProperty(user, 'created_at');
          Reflect.deleteProperty(user, 'updated_at');
          Reflect.deleteProperty(user, 'isValidated');
          req.body.user = user;

          next();
        }
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  };
}

interface IAuthHandlerConfig {
  authRequired?: boolean;
  validationRequired?: boolean;
  roles?: number[];
}
