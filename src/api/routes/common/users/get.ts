/** Current URL Scope: /users */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles, Users } from '../../../../interfaces';
import { UserModel } from '../../../../models';
import { parseGetQuery } from '../../../../utils/parsers';
import { authHandler } from '../../../middlewares';

export default function userRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const userModelInstance = Container.get(UserModel);

  route.get<
    never, // URL parameters
    Users.IUser[] | Users.IUser, // Response body
    never, // Request body
    API.GetParams // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.admin, Roles.RoleEnum.teacher] }),
    async (req, res, next) => {
      try {
        const queryOpts = parseGetQuery(req.query);
        const userList = await userModelInstance.get(undefined, queryOpts);
        res.status(200).json(userList);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
