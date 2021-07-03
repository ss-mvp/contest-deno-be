/** URL Scope: /users */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles } from '../../../../interfaces';
import { UserModel } from '../../../../models';
import { authHandler } from '../../../middlewares';

/**
 * Delete a user by id
 */
export default function userRoute__delete(route: Router) {
  const logger: Logger = Container.get('logger');
  const userModelInstance = Container.get(UserModel);

  route.delete<
    API.WithId, // URL parameters
    never, // Response body
    never, // Request body
    never // Query parameters
  >(
    '/:id',
    authHandler({ roles: [Roles.RoleEnum.admin] }),
    async (req, res) => {
      try {
        Reflect.deleteProperty(req.body, '__user');
        await userModelInstance.delete(req.params.id);
        res.status(204).end();
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
