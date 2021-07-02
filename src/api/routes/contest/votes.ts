import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Auth } from '../../../interfaces';
import { ContestService } from '../../../services';
import { authHandler } from '../../middlewares';

interface IPostVotesBody {
  votes: number[];
}

export default (route: Router) => {
  const logger: Logger = Container.get('logger');
  const contestInstance = Container.get(ContestService);

  // POST /
  route.post<
    never, // URL parameters
    { message: string }, // Response body
    Auth.WithHandler<IPostVotesBody>, // Request body
    never // Query parameters
  >(
    '/',
    // Auth not required, but userID is being pulled to track voting
    authHandler({ authRequired: false }),
    celebrate({
      [Segments.BODY]: Joi.object({
        votes: Joi.array()
          .required()
          .length(3)
          .custom((subId) => subId >= 1), // Hopefully this works for min-val
      }),
    }),
    async (req, res) => {
      try {
        await contestInstance.submitVote(
          req.body.votes,
          +req.body.__user?.id || undefined
        );
        res.status(201).json({ message: 'Votes cast successfully' });
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  console.log('Votes router loaded.');
};
