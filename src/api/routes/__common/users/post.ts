/** Current URL Scope: /users */

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
      [Segments.BODY]: Users.Schema.new(),
    }),
    async (req, res, next) => {
      try {
        const [user] = await userModelInstance.add({
          codename: req.body.codename,
          firstname: req.body.firstname,
          password: req.body.password,
          roleId: req.body.roleId,
          dob: req.body.dob,
          email: req.body.email,
          isValidated: req.body.isValidated,
          lastname: req.body.lastname,
          parentEmail: req.body.parentEmail,
        });
        res.status(200).json(user);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
