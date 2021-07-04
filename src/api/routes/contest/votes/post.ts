import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Auth } from '../../../../interfaces';
import { ClashService } from '../../../../services';
import { authHandler } from '../../../middlewares';

interface IPostVotesBody {
  votes: number[];
}

/**
 * The request body is the ids of the 3 submissions the user voted
 * for in order from first to third place.
 */
export default function contestVotesRoute__post(route: Router) {
  const logger: Logger = Container.get('logger');
  const clashServiceInstance = Container.get(ClashService);

  // POST /
  route.post<
    never, // URL parameters
    { message: string; tomorrow: string }, // Response body
    Auth.WithHandler<IPostVotesBody>, // Request body
    never // Query parameters
  >(
    '/',
    // Auth not required, but userID is being pulled to track voting
    authHandler({ authRequired: false }),
    celebrate({
      [Segments.BODY]: Joi.object({
        votes: Joi.array().required().length(3).items(Joi.number().min(1)),
      }),
    }),
    async (req, res, next) => {
      try {
        const nextPrompt = await clashServiceInstance.submitVote(
          req.body.votes,
          req.body.__user?.id
        );
        res.status(201).json({
          message: 'Votes cast successfully',
          tomorrow: nextPrompt.prompt,
        });
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
