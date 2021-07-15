import jwt, { JwtPayload } from 'jsonwebtoken';
import Container from 'typedi';
import { env } from '../../../config';
import { UserModel } from '../../../models';
import { HTTPError } from '../../../utils';

export async function decodeJWT(token: string) {
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

export async function getUser(userId: number) {
  // Get an instance of the UserModel if we need to role check
  const userModelInstance = Container.get(UserModel);
  const [user] = await userModelInstance.get({ id: +userId });
  if (!user) {
    // Something weird is going on with their token
    throw HTTPError.create(401, 'Could not find user with id ' + userId);
  } else {
    return user;
  }
}

export const INVALID_PERMISSIONS = 'invalid:permissions';
export const REQUIRES_VALIDATION = 'requires:validation';
