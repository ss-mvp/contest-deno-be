import {
  createError,
  IRouter,
  isBool,
  isString,
  log,
  NextFunction,
  Request,
  required,
  Response,
  Router,
  serviceCollection,
} from '../../../deps';
import { INewPrompt, IPrompt } from '../../interfaces/prompts';
import { Roles } from '../../interfaces/roles';
import PromptModel from '../../models/prompts';
import AdminService from '../../services/admin';
import authHandler from '../middlewares/authHandler';
import validate from '../middlewares/validate';

const route = Router();

export default function promptRoute(app: IRouter) {
  const logger: log.Logger = serviceCollection.get('logger');
  const promptModelInstance = serviceCollection.get(PromptModel);

  app.use(['/prompt', '/prompts'], route);

  // GET /
  route.get(
    '/',
    authHandler({ roles: [Roles.teacher, Roles.admin] }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const prompts = await promptModelInstance.get(undefined, {
          limit: parseInt(req.query.limit, 10) || 10,
          offset: parseInt(req.query.offset, 10) || 0,
          orderBy: (req.query.orderBy as keyof IPrompt) || 'id',
          order: (req.query.order as 'ASC' | 'DESC') || 'ASC',
          first: req.query.first === 'true',
        });

        res.setStatus(200).json(prompts);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );

  // GET /active
  route.get(
    '/active',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const [currentPrompt] = await promptModelInstance.get({ active: true });
        if (!currentPrompt) throw createError(404, 'No prompt currently set!');

        res.setStatus(200).json(currentPrompt);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );

  // GET /queue
  route.get(
    '/queue',
    authHandler({ roles: [Roles.teacher, Roles.admin] }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const promptQueue = await promptModelInstance.getUpcoming();
        // Returns an array of prompts that include a `starts_at` date field
        res.setStatus(200).json(promptQueue);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );

  // PUT /active <- this runs the service that updates current prompt
  // TODO postman
  route.put(
    '/active',
    authHandler({ roles: [Roles.admin] }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const adminServiceInstance = serviceCollection.get(AdminService);
        await adminServiceInstance.updateActivePrompt();

        res.setStatus(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );

  // GET /:id
  route.get(
    '/:id',
    authHandler(),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const [prompt] = await promptModelInstance.get({
          id: parseInt(req.params.id, 10),
        });

        res.setStatus(200).json(prompt);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );

  // POST /
  // TODO postman
  route.post(
    '/',
    authHandler({ roles: [Roles.admin] }),
    validate<INewPrompt>({ prompt: [required, isString] }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const [newPrompt] = await promptModelInstance.add({
          prompt: req.body.prompt,
          approved: true,
          creatorId: req.body.user.id,
        });
        res.setStatus(201).json(newPrompt);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );

  // POST /custom
  // TODO postman
  route.post(
    '/custom',
    authHandler({ roles: [Roles.teacher, Roles.admin] }),
    validate({ prompt: [required, isString] }),
    async (req, res) => {
      try {
        const [newPrompt] = await promptModelInstance.add({
          prompt: req.body.prompt,
          approved: false,
          creatorId: req.body.user.id,
        });
        res.setStatus(201).json(newPrompt);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // PUT /:id
  // TODO postman
  route.put(
    '/:id',
    authHandler({ roles: [Roles.admin] }),
    validate<IPrompt>({
      active: [isBool],
      prompt: [isString],
      approved: [isBool],
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        Reflect.deleteProperty(req.body, 'user');
        await promptModelInstance.update(parseInt(req.params.id), req.body);

        res.setStatus(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );

  // DELETE /:id
  // TODO postman
  route.delete(
    '/:id',
    authHandler({ roles: [Roles.admin] }),
    validate({ id: [required] }, 'params'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await promptModelInstance.delete(parseInt(req.params.id));

        res.setStatus(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );

  console.log('Prompt router loaded.');
}
