/** URL Scope: /auth */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Auth, Validations } from '../../../../../interfaces';
import AuthService from '../../../../../services/auth/auth';
import { authHandler } from '../../../../middlewares';

export default function authActivationRoute__post(route: Router) {
  const logger: Logger = Container.get('logger');
  const authServiceInstance = Container.get(AuthService);

  // POST /activation
  route.post<
    never, // URL parameters
    never, // Response body
    Auth.WithHandler<Validations.IGetNewValidationBody>, // Request body
    never // Query parameters
  >(
    '/',
    authHandler(),
    // validate({
    //   newEmail: [required, isEmail, match(emailRegex)],
    //   age: [required, isNumber],
    // }),
    async (req, res) => {
      try {
        await authServiceInstance.SendNewValidationEmail(req.body);
        res.status(204).end();
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
