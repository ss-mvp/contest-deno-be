/** URL Scope: /clash/top */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Roles, Submissions } from '../../../../interfaces';
import { ClashService } from '../../../../services';
import { authHandler } from '../../../middlewares';

interface GetAdminResponseBody {
  subs: Submissions.ISubItem[];
  hasVoted: boolean;
}

export default function contestTopRoute__getAdmin(route: Router) {
  const logger: Logger = Container.get('logger');
  const clashServiceInstance = Container.get(ClashService);

  route.get<
    never, // URL parameters
    GetAdminResponseBody, // Response body
    never, // Request body
    never // Query parameters
  >(
    '/admin',
    authHandler({ roles: [Roles.RoleEnum.admin] }),
    async (req, res, next) => {
      try {
        const subs = await clashServiceInstance.getTopTen();
        res.status(200).json(subs);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
