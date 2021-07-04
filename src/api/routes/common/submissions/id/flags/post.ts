/** URL Scope: /submissions/:id/flags */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Flags, Roles } from '../../../../../../interfaces';
import { SubmissionService } from '../../../../../../services';
import { authHandler } from '../../../../../middlewares';

interface SubmissionFlagPostBody {
  // An array of flag ids
  flags: number[];
}

interface SubmissionFlagPostRes {
  flags: Flags.IFlagItem[];
  message: string;
}

/**
 * Adds a flag to a submission.
 */
export default function submissionFlagRoute__post(route: Router) {
  const logger: Logger = Container.get('logger');
  const subServiceInstance = Container.get(SubmissionService);

  route.post<
    API.WithId, // URL parameters
    SubmissionFlagPostRes, // Response body
    API.WithAuth<SubmissionFlagPostBody>, // Request body
    never // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.teacher, Roles.RoleEnum.admin] }),
    celebrate({
      [Segments.BODY]: Joi.object<SubmissionFlagPostBody>({
        flags: Joi.array().items(Joi.number()),
      }),
    }),
    async (req, res, next) => {
      try {
        const flags = await subServiceInstance.flagSubmission({
          flagIds: req.body.flags,
          submissionId: req.params.id,
          creatorId: req.body.__user.id,
        });
        res
          .status(201)
          .json({ flags, message: 'Successfully flagged submission' });
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
