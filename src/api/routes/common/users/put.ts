/** URL Scope: /users */

import { celebrate, Segments } from 'celebrate';
import { Router } from 'express';
import { DateTime } from 'luxon';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles, Users } from '../../../../interfaces';
import { UserModel } from '../../../../models';
import { authHandler } from '../../../middlewares';

/**
 * Update a user by id
 */
export default function userRoute__put(route: Router) {
  const logger: Logger = Container.get('logger');
  const userModelInstance = Container.get(UserModel);

  route.put<
    API.WithId, // URL parameters
    never, // Response body
    never, // Request body
    never // Query parameters
  >(
    '/:id',
    authHandler({ roles: [Roles.RoleEnum.admin] }),
    celebrate({
      [Segments.BODY]: Users.Schema.partial(),
    }),
    async (req, res, next) => {
      try {
        Reflect.deleteProperty(req.body, '__user');
        await userModelInstance.update(
          req.params.id,
          Object.assign(req.body, { updated_at: DateTime.utc().toISO() })
        );
        res.status(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
