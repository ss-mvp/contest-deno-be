/** URL Scope: /submissions */

import { celebrate, Segments } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Files, Sources, Submissions } from '../../../../interfaces';
import { SubmissionService } from '../../../../services';
import { authHandler, upload } from '../../../middlewares';

interface PostSubmissionBody
  extends API.WithUpload<'story'>,
    Submissions.INewSubmission {}

interface PostSubmissionQuery {
  sourceId?: number;
  tsrcId?: number;
  transcriptionSourceId?: number;
}

export default function submissionRoute__post(route: Router) {
  const logger: Logger = Container.get('logger');
  const subServiceInstance = Container.get(SubmissionService);

  route.post<
    never, // URL parameters
    Submissions.ISubItem, // Response body
    API.WithAuth<PostSubmissionBody>, // Request body
    PostSubmissionQuery // Query parameters
  >(
    '/',
    authHandler({ validationRequired: true }),
    upload('story', { fileLimit: 1 }),
    celebrate({
      [Segments.BODY]: Files.Schema.create('story', { maxFiles: 1 }),
    }),
    async (req, res, next) => {
      try {
        console.log('ep hit', req.body);
        const submission = await subServiceInstance.processSubmission({
          // TODO pass in full array instead of indexing, handle multiple uploads
          uploadResponse: req.body.story[0],
          promptId: req.body.promptId,
          user: req.body.__user,
          rumbleId: req.body.rumbleId || undefined,
          sourceId: req.query.sourceId || Sources.SubSrcEnum.FDSC, // Subs will default to source from FDSC
          transcriptionSourceId:
            req.query.tsrcId || // Look for the shorthand version to be explicitly set
            req.query.transcriptionSourceId || // Fall back to long hand
            Sources.DsTrscSrcEnum.iOS, // Default to being labelled as iOS transcription
          transcription: req.body.transcription,
        });
        console.log(submission);
        res.status(201).json(submission);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
