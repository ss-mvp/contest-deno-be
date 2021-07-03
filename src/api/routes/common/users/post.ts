/** URL Scope: /users */

import { celebrate, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles, Users } from '../../../../interfaces';
import { UserModel } from '../../../../models';
import { authHandler } from '../../../middlewares';

/**
 * An admin-only route that allows the creation of raw users in the db table
 */
export default function userRoute__post(route: Router) {
  const logger: Logger = Container.get('logger');
  const userModelInstance = Container.get(UserModel);

  route.post<
    never, // URL parameters
    Users.IUser, // Response body
    API.WithAuth<Users.INewUser>, // Request body
    API.GetParams // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.admin] }),
    celebrate({
      // TODO test this schema generator
      [Segments.BODY]: Users.UserSchema.new(),
    }),
    async (req, res) => {
      try {
        // Clear the user from auth handler off before insert
        const [user] = await userModelInstance.add(req.body);
        res.status(200).json(user);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
