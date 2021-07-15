import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Auth, Roles } from '../../../interfaces';
import { HTTPError } from '../../../utils';
import { decodeJWT, getUser } from './helpers';

interface IAuthHandlerConfig<Param> {
  authRequired?: boolean;
  validationRequired?: boolean;
  roles?: (number | Roles.RoleEnum)[];

  /** The key of the URL parameter that must match the user's `id` property */
  matchIdOn?: keyof Param;
}

/**
 * Defaults to requiring any authenticated user.
 * Adds to body: { user: IUser };
 */
export default function authHandler<
  Param = Record<string, unknown>,
  Res = Record<string, unknown>,
  Req extends Auth.WithHandler<unknown> = Auth.WithHandler<
    Record<string, unknown>
  >,
  Query = Record<string, unknown>
>(config?: IAuthHandlerConfig<Param>) {
  return async function authHandler__middleware(
    req: Request<Param, Res, Req, Query>,
    res: Response<Res>,
    next: NextFunction
  ) {
    const logger: Logger = Container.get('logger');
    try {
      // Set defaults for these config values
      const roles = config?.roles ?? [1, 2, 3];
      const authRequired = config?.authRequired ?? true;
      const validationRequired = config?.validationRequired ?? false;
      const token = req.get('Authorization');
      const matchIdOn = config?.matchIdOn;

      // Check if we have a token
      if (!token || token === 'null') {
        // If no token, check if auth is required...
        if (authRequired) throw HTTPError.create(401, 'You must be logged in');
        // If it's not required, this is like the voting route, where auth is
        // optional and you can continue to the endpoint without it
        else return next();
      } else {
        // Now that we know we have a token, let's decode and verify it
        logger.debug('Attempting to verify token');
        const { exp, id } = await decodeJWT(token);

        logger.debug('Checking token expiration');
        if (!exp || exp < Date.now()) {
          // If token is expired, restrict
          throw HTTPError.create(401, 'Token is expired');
        } else if (!id) {
          // If token is formatted incorrectly, restrict
          throw HTTPError.create(401, 'Invalid token body');
        } else {
          // The user has been authENTICATED, now we must authORIZE them
          logger.debug(
            `Successfully authenticated, authorizing for roles: ${roles}`
          );

          // Get the full user based off their id from the token
          const user = await getUser(id);

          if (user.roleId !== Roles.RoleEnum.admin) {
            // All the stuff that admins get to skip

            // Role-based authorization
            if (!roles.includes(user.roleId)) {
              throw HTTPError.create(403, {
                message: 'Invalid permissions to access this resource',
                required: roles.map((rId) => Roles.RoleEnum[rId]),
                actual: Roles.RoleEnum[user.roleId],
              });
            }

            // Validation-related authorization
            if (validationRequired && !user.isValidated) {
              throw HTTPError.create(
                403,
                'Account must be validated to access this resource'
              );
            }

            // Authorization where the requested resource can only be accessed by its owner
            // ie. when updating a user profile, you can only update your own
            if (matchIdOn) {
              const userId = +user.id;
              // matchIdOn should be the key of the URL param containing the user's id
              const paramId = +req.params[matchIdOn];
              if (userId !== paramId) {
                throw HTTPError.create(403, 'You do not own this resource');
              }
            }
          }

          // Add the user info to the req body if all goes well (minus password)
          Reflect.deleteProperty(user, 'password');
          req.body.__user = user;

          next();
        }
      }
    } catch (err) {
      logger.error(err);
      next(err);
    }
  };
}
