/** URL Scope: /rumble/feedback */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Feedback } from '../../../../interfaces';
import { RumbleService } from '../../../../services';
import { authHandler } from '../../../middlewares';

export default function rumbleFeedbackRoute__put(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.get<
    never, // URL parameters
    never, // Response body
    API.WithAuth<Feedback.IFeedbackItem[]>, // Request body
    never // Query parameters
  >(
    '/',
    authHandler(),
    celebrate({
      [Segments.BODY]: Joi.array()
        .min(1)
        .required()
        .items(
          Joi.object<Feedback.IFeedbackItem>({
            score1: Joi.number().required(),
            score2: Joi.number().required(),
            score3: Joi.number().required(),
            submissionId: Joi.number().required().min(1),
            voterId: Joi.number().required().min(1),
          })
        ),
    }),
    async (req, res, next) => {
      try {
        await rumbleServiceInstance.addScoresToFeedback(req.body);
        res.status(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
