/** URL Scope: /auth/o/clever */

import { celebrate, Joi, Segments } from 'celebrate';
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
    celebrate({
      [Segments.QUERY]: Joi.object<GetCleverQueryParams>({
        code: Joi.string().required(),
      }),
    }),
    async function asdasd(req, res, next) {
      try {
        const cleverResponse = await cleverInstance.authorizeUser(
          req.query.code
        );
        res.status(200).json(cleverResponse);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
