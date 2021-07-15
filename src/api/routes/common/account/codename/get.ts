/** Current URL Scope: /account/codename */

import { AuthService } from '@services';
import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

interface GetResetQueryParams {
  email: string;
}

interface GetResetResponse {
  message: string;
  recipient?: string;
}

export default function accountCodenameRoute__get(route: Router) {
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
    async (req, res, next) => {
      try {
        await authServiceInstance.getCodenameReminder(req.query.email);

        res.status(200).json({
          message: 'Password reset email sent!',
          recipient: req.query.email,
        });
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}