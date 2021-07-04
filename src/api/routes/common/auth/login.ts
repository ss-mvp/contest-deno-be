/** URL Scope: /auth */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Auth, Roles } from '../../../../interfaces';
import { AuthService } from '../../../../services';
import { HTTPError } from '../../../../utils';

interface AuthPostLoginBody {
  codename: string;
  password: string;
}
interface AuthPostLoginQueryParams {
  admin?: boolean;
}

export default function authRoute__login(route: Router) {
  const logger: Logger = Container.get('logger');
  const authServiceInstance = Container.get(AuthService);

  route.post<
    never, // URL parameters
    Auth.IAuthResponse, // Response body
    AuthPostLoginBody, // Request body
    AuthPostLoginQueryParams // Query parameters
  >(
    '/login',
    celebrate({
      [Segments.BODY]: Joi.object<AuthPostLoginBody>({
        codename: Joi.string().required(),
        password: Joi.string().required(),
      }).options({ abortEarly: false }),
    }),
    async (req, res, next) => {
      try {
        const response = await authServiceInstance.signIn(
          req.body.codename,
          req.body.password
        );

        if (req.query.admin && response.user.roleId !== Roles.RoleEnum.admin) {
          throw HTTPError.create(401, `Must be admin to login`);
        }

        logger.debug(`User (ID: ${response.user.id}) successfully signed in`);
        res.status(201).json(response);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
