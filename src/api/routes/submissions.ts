import {
  IRouter,
  isArray,
  isNumber,
  isString,
  log,
  minNumber,
  Request,
  required,
  Response,
  Router,
  serviceCollection,
  validateArray,
  validateObject,
} from '../../../deps.ts';
import { Roles } from '../../interfaces/roles.ts';
import { INewSubmission } from '../../interfaces/submissions.ts';
import RumbleFeedbackModel from '../../models/rumbleFeedback.ts';
import SubmissionModel from '../../models/submissions.ts';
import SubmissionService from '../../services/submission.ts';
import authHandler from '../middlewares/authHandler.ts';
import upload from '../middlewares/upload.ts';
import validate from '../middlewares/validate.ts';

const route = Router();

export default (app: IRouter) => {
  const logger: log.Logger = serviceCollection.get('logger');
  const subServiceInstance = serviceCollection.get(SubmissionService);
  const subModelInstance = serviceCollection.get(SubmissionModel);
  const feedbackModelInstance = serviceCollection.get(RumbleFeedbackModel);

  app.use(['/submit', '/submission', '/submissions'], route);

  // api/submissions/

  // POST / ?sourceId
  route.post(
    '/',
    authHandler(),
    // This will ensure there is only one item in the story field before upload
    validate<INewSubmission>({
      story: validateArray(
        true,
        validateObject(true, {
          // Check these fields to make sure the field is a file
          name: [required, isString],
          filename: [required, isString],
          size: [required, isNumber],
        }),
        { minLength: 1, maxLength: 1 } // Only one page per sub allowed
      ),
      promptId: [required, isString],
    }),
    upload('story'),
    async (req: Request, res: Response) => {
      try {
        const submission = await subServiceInstance.processSubmission({
          uploadResponse: req.body.story[0], // TODO This endpoint is restricted to one submission for now
          promptId: parseInt(req.body.promptId, 10),
          userId: req.body.user.id,
          sourceId: req.query.sourceId,
          rumbleId: +req.body.rumbleId || undefined,
        });
        res.setStatus(201).json(submission);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // GET /
  route.get('/', authHandler(), async (req: Request, res: Response) => {
    try {
      const idQuery = req.query.ids;
      const idList =
        typeof idQuery === 'string'
          ? idQuery.split(',').map((id) => +id) // Split into a string array and cast those strings to ints
          : typeof idQuery === 'number'
          ? [idQuery]
          : undefined;

      const subs = await subModelInstance.get(undefined, {
        limit: parseInt(req.query.limit, 10) || 10,
        offset: parseInt(req.query.offset, 10) || 0,
        orderBy: req.query.orderBy || 'id',
        order: req.query.order || 'ASC',
        ids: idList,
      });

      res.setStatus(200).json(subs);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  // GET /winner
  route.get('/winner', async (req: Request, res: Response) => {
    try {
      const winner = await subServiceInstance.getRecentWinner();
      res.setStatus(200).json(winner);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  // GET /top
  route.get('/top', async (req: Request, res: Response) => {
    try {
      const subs = await subServiceInstance.getTop3Subs();
      res.setStatus(200).json(subs);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  // GET /top/admin
  route.get(
    '/top/admin',
    authHandler({ roles: [Roles.admin] }),
    async (req: Request, res: Response) => {
      try {
        const subs = await subServiceInstance.getTopTen();
        res.setStatus(200).json(subs);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // POST /top
  route.post(
    '/top',
    authHandler({ roles: [Roles.admin] }),
    validate({
      ids: validateArray(true, [minNumber(1)], {
        minLength: 3,
        maxLength: 3,
      }),
    }),
    async (req: Request, res: Response) => {
      const top3 = await subServiceInstance.setTop3(req.body.ids);
      res.setStatus(201).json({ top3, message: 'Top 3 successfully set!' });
    }
  );

  // GET /:id - This is good for shareability! Public
  route.get('/:id', async (req: Request, res: Response) => {
    try {
      const sub = await subServiceInstance.getById(parseInt(req.params.id, 10));
      res.setStatus(200).json(sub);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  // DELETE /:id
  route.delete(
    '/:id',
    authHandler({ roles: [Roles.teacher, Roles.admin] }),
    async (req: Request, res: Response) => {
      try {
        const subModelInstance = serviceCollection.get(SubmissionModel);
        await subModelInstance.delete(parseInt(req.params.id, 10));
        res.setStatus(204).end();
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // GET /:id/flags
  route.get(
    '/:id/flags',
    authHandler({ roles: [Roles.teacher, Roles.admin] }),
    async (req: Request, res: Response) => {
      try {
        const flags = await subServiceInstance.getFlagsBySubId(
          parseInt(req.params.id, 10)
        );
        res.setStatus(200).json(flags);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // POST /:id/flags
  route.post(
    '/:id/flags',
    authHandler({ roles: [Roles.teacher, Roles.admin] }),
    validate({ flags: [isArray] }, 'body'),
    async (req: Request, res: Response) => {
      try {
        const flags = await subServiceInstance.flagSubmission(
          parseInt(req.params.id, 10),
          req.body.flags,
          req.body.user.id
        );

        res
          .setStatus(201)
          .json({ flags, message: 'Successfully flagged submission' });
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // DELETE /:id/flags/:flagId - Only admin can unflag? Not teachers?
  route.delete(
    '/:id/flags/:flagId',
    authHandler({ roles: [Roles.admin] }),
    async (req: Request, res: Response) => {
      try {
        await subServiceInstance.removeFlag(
          parseInt(req.params.id, 10),
          parseInt(req.params.flagId, 10)
        );
        res.setStatus(204).end();
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  route.get(
    '/:submissionId/feedback',
    authHandler(),
    async (req: Request, res: Response) => {
      try {
        const feedbackScores = await feedbackModelInstance.get({
          submissionId: parseInt(req.params.submissionId, 10),
        });
        res.setStatus(200).json(feedbackScores);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  console.log('Submission router loaded.');
};
