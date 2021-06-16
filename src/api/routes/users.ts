import {
  createError,
  IRouter,
  isBool,
  isEmail,
  isIn,
  isNumber,
  isString,
  log,
  match,
  maxLength,
  minLength,
  moment,
  required,
  Router,
  serviceCollection,
} from '../../../deps.ts';
import {
  codenameRegex,
  emailRegex,
  passwordRegex,
} from '../../config/dataConstraints.ts';
import { IUser } from '../../interfaces/users.ts';
import UserModel from '../../models/users.ts';
import SubmissionService from '../../services/submission.ts';
import validate from '../middlewares/validate.ts';

const route = Router();

export default (app: IRouter) => {
  const logger: log.Logger = serviceCollection.get('logger');
  const userModelInstance = serviceCollection.get(UserModel);
  app.use('/users', route);

  // GET /
  route.get('/', async (req, res) => {
    try {
      const userList = await userModelInstance.get(undefined, {
        limit: parseInt(req.params.limit, 10) || 10,
        offset: parseInt(req.params.offset, 10) || 0,
        orderBy: (req.params.orderBy as keyof IUser) || 'id',
        order: (req.params.order as 'ASC' | 'DESC') || 'ASC',
        first: req.params.first === 'true',
      });

      res.setStatus(200).json(userList);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  route.head('/', async (req, res) => {
    try {
      const userList = await userModelInstance.get(undefined, {
        limit: parseInt(req.params.limit, 10) || 10,
        offset: parseInt(req.params.offset, 10) || 0,
        orderBy: (req.params.orderBy as keyof IUser) || 'id',
        order: (req.params.order as 'ASC' | 'DESC') || 'ASC',
        first: req.params.first === 'true',
      });

      res.setStatus(200).json(userList);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  // GET /:id
  route.get('/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await userModelInstance.get(
        { id: parseInt(userId) },
        { first: true }
      );
      if (!user) throw createError(404, 'User not found!');

      res.setStatus(200).json(user);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  // GET /:id/submissions
  route.get('/:id/submissions', async (req, res) => {
    try {
      const subServiceInstance = serviceCollection.get(SubmissionService);
      const subs = await subServiceInstance.getUserSubs(
        parseInt(req.params.id, 10),
        {
          limit: parseInt(req.query.limit, 10) || 6,
          offset: parseInt(req.query.offset, 10) || 0,
        }
      );
      res.setStatus(200).json(subs);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  // POST /
  route.post(
    '/',
    validate({
      codename: [
        required,
        isString,
        minLength(1),
        maxLength(20),
        match(codenameRegex),
      ],
      email: [required, isEmail, match(emailRegex)],
      parentEmail: [required, isEmail, match(emailRegex)],
      password: [required, isString, match(passwordRegex)],
      age: [required, isNumber],
      roleId: [required, isNumber, isIn([1, 2])],
    }),
    async (req, res) => {
      try {
        const newUser = await userModelInstance.add(req.body, true);

        return res.setStatus(201).json(newUser);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // PUT /:id
  route.put(
    '/:id',
    validate({
      codename: [isString, minLength(1), maxLength(20), match(codenameRegex)],
      email: [isEmail, match(emailRegex)],
      parentEmail: [isEmail, match(emailRegex)],
      password: [isString, match(passwordRegex)],
      age: [isNumber],
      roleId: [isNumber, isIn([1, 2])],
      isValidated: [isBool],
    }),
    async (req, res) => {
      try {
        const userId = req.params.id;
        await userModelInstance.update(parseInt(userId), {
          ...req.body,
          updated_at: moment.utc(),
        });

        return res.setStatus(204).end();
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // DELETE /:id
  route.delete('/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      await userModelInstance.delete(parseInt(userId));

      return res.setStatus(204).end();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  console.log('User router loaded.');
};
