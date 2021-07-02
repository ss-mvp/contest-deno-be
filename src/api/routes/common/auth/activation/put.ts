/** URL Scope: /auth/activation */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Auth } from '../../../../../interfaces';
import { AuthService } from '../../../../../services';
import { authHandler } from '../../../../middlewares';

export default function authActivationRoute__put(route: Router) {
  const logger: Logger = Container.get('logger');
  const authServiceInstance = Container.get(AuthService);

  // PUT /activation
  route.put<
    never, // URL parameters
    Auth.IAuthResponse, // Response body
    Auth.WithHandler, // Request body
    never // Query parameters
  >('/', authHandler(), async (req, res) => {
    try {
      await authServiceInstance.resendValidationEmail(req.body.__user);
      res.status(204).end();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });
}
