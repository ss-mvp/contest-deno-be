import { Request, Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import env from '../../../config/env';
import { Roles } from '../../../interfaces/Enum/roles';
import AuthService from '../../../services/auth';
import { HTTPError } from '../../../utils';
import authHandler from '../../middlewares/authHandler';
import oauth from './oauth';

const route = Router();

export default function authRoute(app: Router) {
  const logger: Logger = Container.get('logger');
  const authServiceInstance = Container.get(AuthService);
  app.use('/auth', route);
  // Add the oauth routes
  oauth(route);

  // POST /register
  route.post(
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
        logger.error(err);
        throw err;
      }
    }
  );

  // POST /login
  route.post(
    '/login',
    // validate({
    //   codename: [required, isString],
    //   password: [required, isString],
    // }),
    async (req, res) => {
      try {
        const response = await authServiceInstance.SignIn(
          req.body.codename,
          req.body.password
        );

        if (req.query.admin && response.user.roleId !== Roles.admin) {
          throw HTTPError.create(401, `Must be admin to login`);
        }

        logger.debug(`User (ID: ${response.user.id}) successfully signed in`);
        res.status(201).json(response);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // GET /activation
  route.get(
    '/activation',
    // validate(
    //   {
    //     token: [required, isString],
    //     email: [required, isEmail, match(emailRegex)],
    //   },
    //   'query'
    // ),
    async (
      req: Request<null, null, null, { email: string; token: string }>,
      res
    ) => {
      try {
        const { token, user } = await authServiceInstance.Validate(
          req.query.email,
          req.query.token
        );
        logger.debug(
          `User (ID: ${user.id}) successfully validated and authenticated`
        );

        const redirectURL = env.REACT_APP_URL + '/activate?authToken=' + token;
        res.redirect(302, redirectURL);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // PUT /activation
  route.put('/activation', authHandler(), async (req, res) => {
    try {
      await authServiceInstance.ResendValidationEmail(req.body.user);
      res.status(204).end();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  // POST /activation
  route.post(
    '/activation',
    authHandler(),
    // validate({
    //   newEmail: [required, isEmail, match(emailRegex)],
    //   age: [required, isNumber],
    // }),
    async (req, res) => {
      try {
        await authServiceInstance.SendNewValidationEmail(req.body);
        res.status(204).end();
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // GET /reset
  route.get(
    '/reset',
    // validate({ email: [required, isEmail, match(emailRegex)] }, 'query'),
    async (
      req: Request<null, { message: string }, null, { email: string }>,
      res
    ) => {
      try {
        await authServiceInstance.GetResetEmail(req.query.email);

        res.status(200).json({ message: 'Password reset email sent!' });
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // POST /reset
  route.post(
    '/reset',
    // validate({
    //   email: [required, isEmail, match(emailRegex)],
    //   password: [required, isString, match(passwordRegex)],
    //   code: [required, isString, match(uuidV5Regex)],
    // }),
    async (req, res) => {
      try {
        await authServiceInstance.ResetPasswordWithCode(
          req.body.email,
          req.body.password,
          req.body.code
        );

        res.status(204).end();
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  console.log('Auth router loaded.');
}
