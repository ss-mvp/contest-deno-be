/** URL Scope: /auth/o/clever */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Auth, Users } from '../../../../../../interfaces';
import CleverService from '../../../../../../services/cleverService';

interface PostSignupQueryParams {
  userType: string;
  cleverId: string;
}

export default function cleverOAuthRoute__postSignup(route: Router) {
  const logger: Logger = Container.get('logger');
  const cleverInstance = Container.get(CleverService);

  route.post<
    never, // URL parameters
    Auth.Clever.responses.IResponse, // Response body
    Users.IOAuthUser, // Req body
    PostSignupQueryParams // Query parameters
  >(
    '/signup',
    // validate<IOAuthUser>({
    //   codename: [required, isString, match(codenameRegex)],
    //   email: [isString, match(emailRegex)],
    //   firstname: [required, isString],
    //   lastname: [required, isString],
    //   password: [required, isString, match(passwordRegex)],
    // }),
    // validate<PostSignupQueryParams>(
    //   {
    //     userType: [required, isString],
    //     cleverId: [required, isString],
    //   },
    //   'query'
    // ),
    async (req, res) => {
      try {
        const cleverResponse = await cleverInstance.registerCleverUser(
          req.body,
          req.query.userType,
          req.query.cleverId
        );
        res.status(201).json(cleverResponse);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
