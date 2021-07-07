import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Container from 'typedi';
import { Logger } from 'winston';
import { env } from '../../config';
import { Auth, Roles } from '../../interfaces';
import { UserModel } from '../../models';
import { HTTPError } from '../../utils';

/**
 * Defaults to requiring any authenticated user.
 * Adds to body: { user: IUser };
 */
export default function authHandlerGenerator<
  Param = Record<string, unknown>,
  Res = Record<string, unknown>,
  Req extends Auth.WithHandler<unknown> = Auth.WithHandler<
    Record<string, unknown>
  >,
  Query = Record<string, unknown>
>(config?: IAuthHandlerConfig) {
  return async function authHandlerMiddleware(
    req: Request<Param, Res, Req, Query>,
    res: Response<Res>,
    next: NextFunction
  ) {
    console.log('auth handler', req.body);
    const logger: Logger = Container.get('logger');
    try {
      // Set defaults for these config values
      const roles = config?.roles ?? [1, 2, 3];
      const authRequired = config?.authRequired ?? true;
      const validationRequired = config?.validationRequired ?? false;
      const token = req.get('Authorization');

      // Check if we have a token
      if (!token || token === 'null') {
        // If no token, check if auth is even required...
        if (authRequired) throw HTTPError.create(401, 'You must be logged in');
        // If it's not required, this is like the voting route, where
        // the token is optional and you can continue without it
        else return next();
      } else {
        logger.debug('Attempting to verify token');
        const { exp, id } = await decodeJWT(token);

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
          const [user] = await userModelInstance.get({ id: +id });
          if (!user) {
            // Something weird is going on with their token
            logger.error('Could not find user with id ' + id);
            return next();
          } else if (
            user.roleId !== Roles.RoleEnum.admin &&
            !roles.includes(user.roleId)
          ) {
            throw HTTPError.create(403, {
              message: 'Invalid permissions to access this resource',
              required: roles.map((rId) => Roles.RoleEnum[rId]),
              actual: Roles.RoleEnum[user.roleId],
            });
          } else if (validationRequired && !user.isValidated) {
            throw HTTPError.create(
              403,
              'Account must be validated to access this resource'
            );
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

async function decodeJWT(token: string) {
  // Promisify the jwt verification for a more modern syntax and better linting
  const decodedToken = await new Promise<
    {
      id?: number;
      email?: string;
      codename?: string;
    } & JwtPayload
  >((resolve, reject) => {
    jwt.verify(
      token,
      env.JWT.SECRET,
      {
        algorithms: [env.JWT.ALGO],
      },
      (err, decodedToken) => {
        if (err) {
          console.log('Error decoding token', err);
          reject(err);
        } else if (!!decodedToken) {
          resolve(decodedToken);
        }
      }
    );
  });
  return decodedToken;
}

interface IAuthHandlerConfig {
  authRequired?: boolean;
  validationRequired?: boolean;
  roles?: number[];
}
