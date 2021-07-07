/** URL Scope: /clash/top */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Clash, Roles } from '../../../../interfaces';
import { ClashService } from '../../../../services';
import { authHandler } from '../../../middlewares';

interface ContestPostTopBody {
  ids: number[];
}

interface ContestPostResponseBody {
  top3: Clash.top3.ITop3[];
  message: string;
}

export default function contestTopRoute__post(route: Router) {
  const logger: Logger = Container.get('logger');
  const clashServiceInstance = Container.get(ClashService);

  route.post<
    never, // URL parameters
    ContestPostResponseBody, // Response body
    API.WithAuth<ContestPostTopBody>, // Request body
    never // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.admin] }),
    celebrate({
      [Segments.BODY]: Joi.object<ContestPostTopBody>({
        ids: Joi.array().length(3).items(Joi.number().min(1)),
      }),
    }),
    async (req, res, next) => {
      try {
        const top3 = await clashServiceInstance.setTop3(req.body.ids);
        res.status(201).json({ top3, message: 'Top 3 successfully set!' });
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
