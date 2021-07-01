import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import Container from 'typedi';
import { v5 } from 'uuid';
import { Logger } from 'winston';
import { env } from '../../config';
import { Users } from '../../interfaces';

const logger: Logger = Container.get('logger');

/**
 * The helpers are functions that were able to be moved off of the class as they
 * do not rely on any of its methods or properties.
 */

/** */
export function generateToken(user: Omit<Users.IUser, 'password'>) {
  logger.debug(`Generating JWT for user (ID: ${user.id})`);
  const exp = DateTime.utc().plus({ days: env.AUTH_TOKEN_EXP_TIME });
  logger.debug(`Signing JWT for user (ID: ${user.id})`);
  return jwt.sign(
    {
      exp: exp.valueOf(),
      id: user.id.toString(),
      email: user.email,
      codename: user.codename,
    },
    env.JWT.SECRET,
    { algorithm: env.JWT.ALGO }
  );
}

export function generateValidationURL(codename: string, email: string) {
  try {
    logger.debug(
      `Generating email validation token for user (EMAIL: ${email})`
    );
    const token = v5(codename, env.UUID_NAMESPACE);
    const urlParams = new URLSearchParams({ token, email });
    const url = env.SERVER_URL + '/api/auth/activation?' + urlParams.toString();
    return { url, code: token };
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

export function generateResetCode(user: Users.IUser) {
  try {
    logger.debug(
      `Generating a new password reset code for user (ID: ${user.id})`
    );
    const resetToken = v5(user.codename, env.UUID_NAMESPACE);
    logger.debug(`Reset code generated for user (ID: ${user.id})`);
    return resetToken;
  } catch (err) {
    logger.error(err);
    throw err;
  }
}
