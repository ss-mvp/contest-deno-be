import {
  createError,
  IRouter,
  isEmail,
  isNumber,
  isString,
  log,
  match,
  Request,
  required,
  Response,
  Router,
  serviceCollection,
} from '../../../deps.ts';
import {
  codenameRegex,
  emailRegex,
  passwordRegex,
  uuidV5Regex,
} from '../../config/dataConstraints.ts';
import env from '../../config/env.ts';
import { Roles } from '../../interfaces/roles.ts';
import { INewUser } from '../../interfaces/users.ts';
import AuthService from '../../services/auth.ts';
import authHandler from '../middlewares/authHandler.ts';
import validate from '../middlewares/validate.ts';
import oauth from './oauth.ts';

const route = Router();

export default (app: IRouter) => {
  const logger: log.Logger = serviceCollection.get('logger');
  const authServiceInstance = serviceCollection.get(AuthService);
  app.use('/auth', route);
  // Add the oauth routes
  oauth(route);

  // POST /register
  route.post(
    '/register',
    validate<INewUser>({
      codename: [required, isString, match(codenameRegex)],
      email: [required, isEmail, match(emailRegex)],
      parentEmail: [required, isEmail, match(emailRegex)],
      password: [required, isString, match(passwordRegex)],
      age: [required, isNumber],
      firstname: [required, isString],
      lastname: [required, isString],
    }),
    async (req: Request, res: Response) => {
      try {
        const response = await authServiceInstance.SignUp(req.body);

        res.setStatus(201).json(response);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // POST /login
  route.post(
    '/login',
    validate({
      codename: [required, isString],
      password: [required, isString],
    }),
    async (req: Request, res: Response) => {
      try {
        const response = await authServiceInstance.SignIn(
          req.body.codename,
          req.body.password
        );

        if (req.query.admin && response.user.roleId !== Roles.admin) {
          throw createError(401, `Must be admin to login`);
        }

        logger.debug(`User (ID: ${response.user.id}) successfully signed in`);
        res.setStatus(201).json(response);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // GET /activation
  route.get(
    '/activation',
    validate(
      {
        token: [required, isString],
        email: [required, isEmail, match(emailRegex)],
      },
      'query'
    ),
    async (req: Request, res: Response) => {
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
  route.put(
    '/activation',
    authHandler({ authRequired: true }),
    async (req: Request, res: Response) => {
      console.log('req.body.user', req.body.user);
      try {
        await authServiceInstance.ResendValidationEmail(req.body.user);
        res.setStatus(204).json();
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // GET /reset
  route.get(
    '/reset',
    validate({ email: [required, isEmail, match(emailRegex)] }, 'query'),
    async (req: Request, res: Response) => {
      try {
        await authServiceInstance.GetResetEmail(req.query.email);

        res.setStatus(200).json({ message: 'Password reset email sent!' });
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // POST /reset
  route.post(
    '/reset',
    validate({
      email: [required, isEmail, match(emailRegex)],
      password: [required, isString, match(passwordRegex)],
      code: [required, isString, match(uuidV5Regex)],
    }),
    async (req: Request, res: Response) => {
      try {
        await authServiceInstance.ResetPasswordWithCode(
          req.body.email,
          req.body.password,
          req.body.code
        );

        res.setStatus(204).end();
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  console.log('Auth router loaded.');
};
