/** URL Scope: /auth/reset */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { AuthService } from '../../../../../services';

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
    celebrate({
      [Segments.QUERY]: Joi.object<GetResetQueryParams>({
        email: Joi.string().email().required(),
      }),
    }),
    async (req, res) => {
      try {
        await authServiceInstance.getResetEmail(req.query.email);

        res.status(200).json({ message: 'Password reset email sent!' });
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
