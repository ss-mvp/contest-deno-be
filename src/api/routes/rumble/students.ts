import { IRouter, log, Router, serviceCollection } from '../../../../deps.ts';
import { Roles } from '../../../interfaces/roles.ts';
import RumbleService from '../../../services/rumble.ts';
import authHandler from '../../middlewares/authHandler.ts';

const route = Router();

export default (app: IRouter) => {
  const logger: log.Logger = serviceCollection.get('logger');
  const rumbleServiceInstance = serviceCollection.get(RumbleService);
  app.use('/students', route);

  // GET /students/:studentId/sections returns ISection[]
  route.get(
    '/:studentId/sections',
    authHandler({ roles: [Roles.admin, Roles.user] }),
    async (req, res) => {
      try {
        const sections = await rumbleServiceInstance.getSections(req.body.user);
        res.setStatus(200).json(sections);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  route.get(
    '/:studentId/submissions',
    authHandler({ roles: [Roles.teacher, Roles.admin] }),
    async (req, res) => {
      try {
        const submissions = await rumbleServiceInstance.getSubmissionsByStudentId(
          parseInt(req.params.studentId, 10)
        );
        res.setStatus(200).json(submissions);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  console.log('Rumble students route loaded.');
};
