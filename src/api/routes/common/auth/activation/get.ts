/** URL Scope: /auth */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { env } from '../../../../../config';
import AuthService from '../../../../../services/auth';

interface GetActivationQueryParams {
  email: string;
  token: string;
}

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
    // validate<GetActivationQueryParams>(
    //   {
    //     token: [required, isString],
    //     email: [required, isEmail, match(emailRegex)],
    //   },
    //   'query'
    // ),
    async (req, res) => {
      try {
        const { token } = await authServiceInstance.Validate(
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
