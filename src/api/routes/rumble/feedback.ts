import {
  IRouter,
  log,
  required,
  Router,
  serviceCollection,
} from '../../../../deps.ts';
import RumbleFeedbackModel from '../../../models/rumbleFeedback.ts';
import FeedbackService from '../../../services/feedback.ts';
import RumbleService from '../../../services/rumble.ts';
import authHandler from '../../middlewares/authHandler.ts';
import validate from '../../middlewares/validate.ts';

const route = Router();

export default (app: IRouter) => {
  const logger: log.Logger = serviceCollection.get('logger');
  const feedbackServiceInstance = serviceCollection.get(FeedbackService);
  const feedbackModelInstance = serviceCollection.get(RumbleFeedbackModel);
  const rumbleServiceInstance = serviceCollection.get(RumbleService);

  app.use('/feedback', route);

  // /feedback/complete?studentId=:studentId&rumbleId=:rumbleId
  route.get(
    '/complete',
    validate(
      {
        studentId: [required],
        rumbleId: [required],
      },
      'query'
    ),
    async (req, res) => {
      try {
        const hasVoted = await feedbackServiceInstance.checkIfFeedbackWasSubmitted(
          {
            rumbleId: parseInt(req.query.rumbleId, 10),
            studentId: parseInt(req.query.studentId, 10),
          }
        );

        res.setStatus(200).json(hasVoted);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  route.get(
    '/',
    validate(
      {
        studentId: [required],
        rumbleId: [required],
      },
      'query'
    ),
    async (req, res) => {
      try {
        const feedback = await feedbackModelInstance.getFeedbackByRumbleAndVoterIds(
          {
            rumbleId: parseInt(req.query.rumbleId, 10),
            voterId: parseInt(req.query.studentId, 10),
          }
        );
        res.setStatus(200).json(feedback);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  route.put('/', authHandler(), async (req, res) => {
    try {
      await rumbleServiceInstance.addScoresToFeedback(req.body);
      res.setStatus(204).end();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  console.log('Feedback router loaded.');
};
