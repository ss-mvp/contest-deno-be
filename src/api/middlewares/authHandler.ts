import {
  createError,
  jwt,
  log,
  NextFunction,
  Request,
  Response,
  serviceCollection,
} from '../../../deps.ts';
import env from '../../config/env.ts';
import UserModel from '../../models/users.ts';

/**
 * Defaults to requiring any authenticated user.
 * Adds to body: { user: IUser };
 */
export default (config?: IAuthHandlerConfig) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set defaults for these config values
  const roles = config?.roles ?? [1, 2, 3];
  const authRequired = config?.authRequired ?? true;

  const logger: log.Logger = serviceCollection.get('logger');
  const token = req.get('Authorization');

  if (!token || token === 'null') {
    // If no token, check if auth is even required...
    if (authRequired) throw createError(401, 'You must be logged in');
    // If it's not required, this is like the voting route, where
    // the token is optional and you can continue without it
    else return next();
  } else {
    // If it's there, we'll try to
    try {
      logger.debug('Attempting to verify token');
      const { id, exp } = (await jwt.verify(
        token,
        env.JWT.SECRET,
        env.JWT.ALGO
      )) as jwt.Payload & { email: string; id: string; codename: string };

      logger.debug('Checking token expiration');
      if (!exp || exp < Date.now()) {
        // If token is expired, let them know
        throw createError(401, 'Token is expired');
      } else if (!id) {
        // If token is formatted incorrectly
        throw createError(401, 'Invalid token body');
      } else {
        logger.debug(
          `Successfully authenticated, authorizing for roles: \
            ${roles.join(', ')}`
        );
        // Get an instance of the UserModel if we need to role check
        const userModelInstance = serviceCollection.get(UserModel);
        const [user] = await userModelInstance.get({ id: parseInt(id, 10) });
        if (!roles.includes(user.roleId)) {
          throw createError(401, 'Must be admin');
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

interface IAuthHandlerConfig {
  authRequired?: boolean;
  roles?: number[];
}
