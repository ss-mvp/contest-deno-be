import {
  IRouter,
  log,
  minNumber,
  Request,
  Response,
  Router,
  serviceCollection,
  validateArray,
} from '../../../../deps';
import ContestService from '../../../services/contest';
import authHandler from '../../middlewares/authHandler';
import validate from '../../middlewares/validate';

const route = Router();

export default (app: IRouter) => {
  const logger: log.Logger = serviceCollection.get('logger');
  const contestInstance = serviceCollection.get(ContestService);
  app.use('/votes', route);

  // POST /
  route.post(
    '/',
    // Auth not required, but userID is being pulled to track voting
    authHandler({ authRequired: false }),
    validate({
      votes: validateArray(true, [minNumber(1)], {
        minLength: 3,
        maxLength: 3,
      }),
    }),
    async (req: Request, res: Response) => {
      try {
        await contestInstance.submitVote(
          req.body.votes,
          parseInt(req.body.user?.id, 10) || undefined
        );
        res.setStatus(201).json({ message: 'Votes cast successfully' });
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  console.log('Votes router loaded.');
};
