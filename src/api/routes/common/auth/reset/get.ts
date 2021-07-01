/** URL Scope: /auth/reset */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import AuthService from '../../../../../services/auth/auth';

interface GetResetQueryParams {
  email: string;
}

interface GetResetResponse {
  message: string;
}

export default function authResetRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const authServiceInstance = Container.get(AuthService);

  route.get<
    never, // URL parameters
    GetResetResponse, // Response body
    never, // Request body
    GetResetQueryParams // Query parameters
  >(
    '/',
    // validate<GetResetQueryParams>({ email: [required, isEmail, match(emailRegex)] }, 'query'),
    async (req, res) => {
      try {
        await authServiceInstance.GetResetEmail(req.query.email);

        res.status(200).json({ message: 'Password reset email sent!' });
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
