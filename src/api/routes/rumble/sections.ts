import {
  IRouter,
  isString,
  log,
  required,
  Router,
  serviceCollection,
} from '../../../../deps';
import { Roles } from '../../../interfaces/roles';
import RumbleService from '../../../services/rumble';
import authHandler from '../../middlewares/authHandler';
import validate from '../../middlewares/validate';

const route = Router();

export default (app: IRouter) => {
  const logger: log.Logger = serviceCollection.get('logger');
  const rumbleServiceInstance = serviceCollection.get(RumbleService);
  app.use('/sections', route);

  // GET /sections/:sectionId/student - get students in a section
  route.get(
    '/:sectionId/students',
    authHandler({ roles: [Roles.teacher, Roles.admin] }),
    async (req, res) => {
      try {
        const students = await rumbleServiceInstance.getStudentsInSection(
          parseInt(req.params.sectionId, 10)
        );
        res.setStatus(200).json(students);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  // POST /:sectionId/students/:studentId - adds a student to a section
  route.post(
    '/:sectionId/students/:studentId',
    validate({
      joinCode: [required, isString],
    }),
    async (req, res) => {
      try {
        const section = await rumbleServiceInstance.addChildToSection(
          req.body.joinCode,
          parseInt(req.params.sectionId, 10),
          parseInt(req.params.studentId, 10)
        );

        res.setStatus(201).json(section);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  console.log('Rumble sections route loaded successfully.');
};
