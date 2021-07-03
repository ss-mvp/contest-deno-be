/** URL Scope: /users */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles, Users } from '../../../../interfaces';
import { UserModel } from '../../../../models';
import { HTTPError } from '../../../../utils';
import { authHandler } from '../../../middlewares';

export default function userRoute__getById(route: Router) {
  const logger: Logger = Container.get('logger');
  const userModelInstance = Container.get(UserModel);

  route.get<
    API.WithId, // URL parameters
    Users.IUser, // Response body
    never, // Request body
    never // Query parameters
  >(
    '/:id',
    authHandler({ roles: [Roles.RoleEnum.admin, Roles.RoleEnum.teacher] }),
    async (req, res) => {
      try {
        const user = await userModelInstance.get(
          { id: req.params.id },
          { first: true }
        );
        if (!user) throw HTTPError.create(404, 'User not found!');
        res.status(200).json(user);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
