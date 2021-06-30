/** URL Scope: /auth */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Auth, Users } from '../../../../interfaces';
import AuthService from '../../../../services/auth';

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
    // validate<INewUser>({
    //   codename: [required, isString, match(codenameRegex)],
    //   email: [required, isEmail, match(emailRegex)],
    //   parentEmail: [isEmail, match(emailRegex)],
    //   password: [required, isString, match(passwordRegex)],
    //   dob: [required, isDate],
    //   firstname: [required, isString],
    //   lastname: [required, isString],
    // }),
    async (req, res) => {
      try {
        const response = await authServiceInstance.register({
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

        res.status(201).json(response);
      } catch (err) {
        logger.error('Error in /register', err);
        throw err;
      }
    }
  );

  logger.debug('Auth router loaded.');
}
