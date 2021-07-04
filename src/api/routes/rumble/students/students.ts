import {
  IRouter,
  log,
  required,
  Router,
  serviceCollection,
} from '../../../../deps';
import { Roles } from '../../../../interfaces/Enum/roles';
import RumbleService from '../../../../services/rumble';
import authHandler from '../../../middlewares/authHandler';
import validate from '../../middlewares/validate';

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
    validate({ sectionId: [required] }, 'query'),
    async (req, res) => {
      try {
        const submissions = await rumbleServiceInstance.getSubsByStudentAndSection(
          parseInt(req.params.studentId, 10),
          parseInt(req.query.sectionId, 10)
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
