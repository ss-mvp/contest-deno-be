/** Current URL Scope: /auth */

import { constraints } from '@config';
import { Auth } from '@interfaces';
import { AuthService } from '@services';
import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

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
    celebrate({
      [Segments.BODY]: Joi.object<Auth.resets.IResetPostBody>({
        email: Joi.string().required().email(),
        password: Joi.string().required().regex(constraints.passwordRegex),
        code: Joi.string().required().regex(constraints.uuidV5Regex),
      }),
    }),
    async (req, res, next) => {
      try {
        await authServiceInstance.resetPasswordWithCode(
          req.body.email,
          req.body.password,
          req.body.code
        );

        res.status(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
