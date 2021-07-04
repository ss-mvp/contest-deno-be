/** URL Scope: /auth/o/clever */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { constraints } from '../../../../../../config';
import { Auth, Users } from '../../../../../../interfaces';
import { CleverService } from '../../../../../../services';

interface PostSignupQueryParams {
  userType: string;
  cleverId: string;
}

export default function cleverOAuthRoute__postSignup(route: Router) {
  const logger: Logger = Container.get('logger');
  const cleverInstance = Container.get(CleverService);

  route.post<
    never, // URL parameters
    Auth.IAuthResponse, // Response body
    Users.IOAuthUser, // Req body
    PostSignupQueryParams // Query parameters
  >(
    '/signup',
    celebrate({
      [Segments.BODY]: Joi.object<Users.IOAuthUser>({
        codename: Joi.string().required().regex(constraints.codenameRegex),
        email: Joi.string().email(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        password: Joi.string().required().regex(constraints.passwordRegex),
      }),
      [Segments.QUERY]: Joi.object<PostSignupQueryParams>({
        cleverId: Joi.string().required(),
        userType: Joi.string().required(),
      }),
    }),
    async (req, res, next) => {
      try {
        const cleverResponse = await cleverInstance.registerCleverUser(
          req.body,
          req.query.userType,
          req.query.cleverId
        );
        res.status(201).json(cleverResponse);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
