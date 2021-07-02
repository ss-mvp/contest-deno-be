/** URL Scope: /auth/o/clever */

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

  // POST /api/auth/o/clever/merge?cleverId=someid
  route.post<
    never, // URL parameters
    Auth.IAuthResponse, // Response body
    PostMergeRequestBody, // Request body
    PostMergeQueryParams // Query parameters
  >(
    '/merge',
    // validate<PostMergeRequestBody>({
    //   codename: [required, isString],
    //   password: [required, isString],
    // }),
    // validate<PostMergeQueryParams>({ cleverId: [required, isString] }, 'query'),
    async (req, res) => {
      try {
        const authResponse = await cleverInstance.loginAndMerge(
          req.body.codename,
          req.body.password,
          req.query.cleverId
        );
        res.status(201).json(authResponse);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
