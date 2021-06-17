import { IRouter, log, Router, serviceCollection } from '../../../../deps.ts';
import { Roles } from '../../../interfaces/roles.ts';
import RumbleService from '../../../services/rumble.ts';
import authHandler from '../../middlewares/authHandler.ts';

const route = Router();

export default (app: IRouter) => {
  const logger: log.Logger = serviceCollection.get('logger');
  const rumbleServiceInstance = serviceCollection.get(RumbleService);

  app.use('/rumbles', route);

  route.get('/:rumbleId', authHandler(), async (req, res) => {
    try {
      const rumble = await rumbleServiceInstance.getById(
        parseInt(req.params.rumbleId, 10)
      );
      res.setStatus(200).json(rumble);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  // GET /rumbles/:rumbleId/students - returns a list of students with subs
  route.get(
    '/:rumbleId/students',
    authHandler({ roles: [Roles.admin, Roles.teacher] }),
    async (req, res) => {
      try {
        const students = await rumbleServiceInstance.getStudentsWithSubForRumble(
          parseInt(req.params.rumbleId, 10)
        );
        res.setStatus(200).json(students);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  route.get(
    '/:rumbleId/students/:studentId',
    authHandler(),
    async (req, res) => {
      try {
        const sub = await rumbleServiceInstance.getSubForStudentByRumble(
          parseInt(req.params.rumbleId, 10),
          parseInt(req.params.studentId, 10)
        );
        res.setStatus(200).json(sub);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // PUT /rumbles/:rumbleId/start - begins a game and returns a Date
  route.put(
    '/:rumbleId/section/:sectionId/start',
    authHandler({ roles: [Roles.teacher, Roles.admin] }),
    async (req, res) => {
      try {
        const endTime: Date = await rumbleServiceInstance.startRumble(
          parseInt(req.params.sectionId, 10),
          parseInt(req.params.rumbleId, 10)
        );
        res.setStatus(201).json(endTime);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  route.get('/:rumbleId/feedback', authHandler(), async (req, res) => {
    try {
      const submissions = await rumbleServiceInstance.getSubsForFeedback(
        parseInt(req.query.studentId, 10),
        parseInt(req.params.rumbleId, 10)
      );
      res.setStatus(200).json(submissions);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  // endpoint for teachers to start feedback
  route.put('/:rumbleId/feedback/start', authHandler(), async (req, res) => {
    try {
      await rumbleServiceInstance.startFeedback(
        parseInt(req.params.rumbleId, 10)
      );
      res.setStatus(204).end();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });
};
