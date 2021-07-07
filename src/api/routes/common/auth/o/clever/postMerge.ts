/** URL Scope: /auth/o/clever */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Auth } from '../../../../../../interfaces';
import { CleverService } from '../../../../../../services';

interface PostMergeQueryParams {
  cleverId: string;
}

interface PostMergeRequestBody {
  codename: string;
  password: string;
}

export default function cleverOAuthRoute__postMerge(route: Router) {
  const logger: Logger = Container.get('logger');
  const cleverInstance = Container.get(CleverService);

  route.post<
    never, // URL parameters
    Auth.IAuthResponse, // Response body
    PostMergeRequestBody, // Request body
    PostMergeQueryParams // Query parameters
  >(
    '/merge',
    celebrate({
      [Segments.BODY]: Joi.object<PostMergeRequestBody>({
        codename: Joi.string().required(),
        password: Joi.string().required(),
      }),
      [Segments.QUERY]: Joi.object<PostMergeQueryParams>({
        cleverId: Joi.string().required(),
      }),
    }),
    async (req, res, next) => {
      try {
        const authResponse = await cleverInstance.loginAndMerge(
          req.body.codename,
          req.body.password,
          req.query.cleverId
        );
        res.status(201).json(authResponse);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
