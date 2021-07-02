/** URL Scope: /auth/o/clever */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Clever } from '../../../../../../interfaces';
import { CleverService } from '../../../../../../services';

interface GetCleverQueryParams {
  code: string;
}

export default function cleverOAuthRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const cleverInstance = Container.get(CleverService);

  route.get<
    never, // URL parameters
    Clever.auth.IResponse, // Response body
    never, // Request body
    GetCleverQueryParams // Query parameters
  >(
    '/',
    // validate<GetCleverQueryParams>({ code: [required, isString] }, 'query'),
    async function asdasd(req, res) {
      try {
        const cleverResponse = await cleverInstance.authorizeUser(
          req.query.code
        );
        res.status(200).json(cleverResponse);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
