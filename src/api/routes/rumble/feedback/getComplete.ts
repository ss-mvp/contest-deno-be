/** URL Scope: /rumble/feedback */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { FeedbackService } from '../../../../services';
import { authHandler } from '../../../middlewares';

interface GetRumbleCompleteQuery {
  rumbleId: number;
  studentId: number;
}

/**
 * Check if the student has submitted feedback for the given rumble already.
 */
export default function rumbleFeedbackRoute__getComplete(route: Router) {
  const logger: Logger = Container.get('logger');
  const feedbackServiceInstance = Container.get(FeedbackService);

  route.get<
    never, // URL parameters
    boolean, // Response body
    never, // Request body
    GetRumbleCompleteQuery // Query parameters
  >(
    '/complete',
    authHandler(),
    celebrate({
      [Segments.QUERY]: Joi.object<GetRumbleCompleteQuery>({
        rumbleId: Joi.number().required(),
        studentId: Joi.number().required(),
      }),
    }),
    async (req, res, next) => {
      try {
        const hasVoted = await feedbackServiceInstance.checkIfFeedbackWasSubmitted(
          {
            rumbleId: req.query.rumbleId,
            studentId: req.query.studentId,
          }
        );

        res.status(200).json(hasVoted);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
