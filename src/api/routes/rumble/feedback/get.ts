/** URL Scope: /rumble/feedback */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Feedback } from '../../../../interfaces';
import { RumbleFeedbackModel } from '../../../../models';
import { authHandler } from '../../../middlewares';

interface GetRumbleFeedbackQuery {
  rumbleId: number;
  studentId: number;
}

/**
 * Get the feedback for the given student's submission to the given rumble.
 */
export default function rumbleFeedbackRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const feedbackModelInstance = Container.get(RumbleFeedbackModel);

  route.get<
    never, // URL parameters
    Feedback.IFeedbackItem[], // Response body
    never, // Request body
    GetRumbleFeedbackQuery // Query parameters
  >(
    '/',
    authHandler(),
    celebrate({
      [Segments.QUERY]: Joi.object<GetRumbleFeedbackQuery>({
        rumbleId: Joi.number().required(),
        studentId: Joi.number().required(),
      }),
    }),
    async (req, res, next) => {
      try {
        const feedback = await feedbackModelInstance.getFeedbackByRumbleAndVoterIds(
          {
            rumbleId: req.query.rumbleId,
            voterId: req.query.studentId,
          }
        );
        res.status(200).json(feedback);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
