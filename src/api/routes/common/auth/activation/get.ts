/** URL Scope: /auth/activation */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { env } from '../../../../../config';
import { AuthService } from '../../../../../services';

// TODO add some way to specify a redirect uri from the client
interface GetActivationQueryParams {
  email: string;
  token: string;
}

/**
 * On success, this route will redirect you to a page on the frontend
 * where you will be logged in.
 */
export default function authActivationRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const authServiceInstance = Container.get(AuthService);

  route.get<
    never, // URL parameters
    never, // Response body
    never, // Request body
    GetActivationQueryParams // Query parameters
  >(
    '/',
    celebrate({
      [Segments.QUERY]: Joi.object<GetActivationQueryParams>({
        email: Joi.string().required().email(),
        token: Joi.string().required(),
      }),
    }),
    async (req, res) => {
      try {
        const { token } = await authServiceInstance.validate(
          req.query.email,
          req.query.token
        );

        const redirectURL = env.REACT_APP_URL + '/activate?authToken=' + token;
        res.redirect(302, redirectURL);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
