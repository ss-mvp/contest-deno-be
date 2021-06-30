/** URL Scope: /auth */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Auth } from '../../../../../interfaces';
import AuthService from '../../../../../services/auth';

export default function authResetRoute__post(route: Router) {
  const logger: Logger = Container.get('logger');
  const authServiceInstance = Container.get(AuthService);

  // POST /reset
  route.post<
    never, // URL parameters
    never, // Response body
    Auth.resets.IResetPostBody, // Request body
    never // Query parameters
  >(
    '/',
    // validate<Auth.resets.IResetPostBody>({
    //   email: [required, isEmail, match(emailRegex)],
    //   password: [required, isString, match(passwordRegex)],
    //   code: [required, isString, match(uuidV5Regex)],
    // }),
    async (req, res) => {
      try {
        await authServiceInstance.ResetPasswordWithCode(
          req.body.email,
          req.body.password,
          req.body.code
        );

        res.status(204).end();
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
