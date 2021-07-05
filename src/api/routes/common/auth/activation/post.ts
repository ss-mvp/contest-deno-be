/** URL Scope: /auth/activation */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Auth, Validations } from '../../../../../interfaces';
import { AuthService } from '../../../../../services';
import { authHandler } from '../../../../middlewares';

export default function authActivationRoute__post(route: Router) {
  const logger: Logger = Container.get('logger');
  const authServiceInstance = Container.get(AuthService);

  route.post<
    never, // URL parameters
    never, // Response body
    Auth.WithHandler<Validations.IGetNewValidationBody>, // Request body
    never // Query parameters
  >(
    '/',
    authHandler(),
    celebrate({
      [Segments.BODY]: Joi.object<
        Auth.WithHandler<Validations.IGetNewValidationBody>
      >({
        newEmail: Joi.string().required().email(),
        age: Joi.number().optional(),
      })
        .keys({ __user: Joi.any() }) // Lets us ignore the user object added by authHandler
        .options({ abortEarly: false }),
    }),
    async (req, res, next) => {
      try {
        await authServiceInstance.newValidationEmail({
          __user: req.body.__user,
          age: req.body.age,
          newEmail: req.body.newEmail,
        });
        res.status(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
