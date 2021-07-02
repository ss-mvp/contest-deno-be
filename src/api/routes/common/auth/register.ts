/** URL Scope: /auth */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { constraints } from '../../../../config';
import { Auth, Roles, Users } from '../../../../interfaces';
import { AuthService } from '../../../../services';

export default function authRoute__register(route: Router) {
  const logger: Logger = Container.get('logger');
  const authServiceInstance = Container.get(AuthService);

  route.post<
    never, // URL parameters
    Auth.IAuthResponse, // Response body
    Users.INewUser, // Request body
    never // Query parameters
  >(
    '/register',
    celebrate({
      [Segments.BODY]: Joi.object<Users.INewUser>({
        codename: Joi.string().required().regex(constraints.codenameRegex),
        dob: Joi.date().required(),
        email: Joi.string().required().email(),
        parentEmail: Joi.string().email(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        password: Joi.string().required().regex(constraints.passwordRegex),
        roleId: Joi.number()
          .required()
          // Don't let users sign up as an admin from this endpoint
          .disallow(Roles.RoleEnum.admin)
          // If unset, default to signup as a standard user for compatibility
          .default(Roles.RoleEnum.user),
      }),
    }),
    async (req, res) => {
      try {
        const response = await authServiceInstance.register({
          codename: req.body.codename,
          firstname: req.body.firstname,
          password: req.body.password,
          roleId: req.body.roleId,
          dob: req.body.dob,
          email: req.body.email,
          isValidated: false,
          lastname: req.body.lastname,
          parentEmail: req.body.parentEmail,
        });

        res.status(201).json(response);
      } catch (err) {
        logger.error('Error in /register', err);
        throw err;
      }
    }
  );

  logger.debug('Auth router loaded.');
}
