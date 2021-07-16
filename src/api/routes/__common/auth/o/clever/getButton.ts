/** Current URL Scope: /auth/o/clever */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { CleverService } from '../../../../../../services';

interface GetCleverButtonResponse {
  url: string;
}

export default function cleverOAuthRoute__getButton(route: Router) {
  const logger: Logger = Container.get('logger');
  const cleverInstance = Container.get(CleverService);

  route.get<
    never, // URL parameters
    GetCleverButtonResponse, // Response body
    never, // Request body
    never // Query parameters
  >('/button', (req, res, next) => {
    try {
      const loginButtonURI = cleverInstance.getLoginButtonURI();
      res.status(200).json({ url: loginButtonURI });
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
