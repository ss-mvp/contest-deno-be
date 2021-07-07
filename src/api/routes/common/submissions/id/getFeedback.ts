/** URL Scope: /submissions/:id */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Feedback } from '../../../../../interfaces';
import { RumbleFeedbackModel } from '../../../../../models';
import { authHandler } from '../../../../middlewares';

/**
 * Gets the feedback for a submission by its id.
 */
export default function submissionIdRoute__getFeedback(route: Router) {
  const logger: Logger = Container.get('logger');
  const feedbackModelInstance = Container.get(RumbleFeedbackModel);

  route.get<
    API.WithId, // URL parameters
    Feedback.IFeedbackItem[], // Response body
    never, // Request body
    never // Query parameters
  >('/feedback', authHandler(), async (req, res, next) => {
    try {
      const feedbackScores = await feedbackModelInstance.get({
        submissionId: req.params.id,
      });
      res.status(200).json(feedbackScores);
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
