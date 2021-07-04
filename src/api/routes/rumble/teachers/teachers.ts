import {
  IRouter,
  isNumber,
  isString,
  log,
  minNumber,
  required,
  Router,
  serviceCollection,
  validateArray,
  validateObject,
} from '../../../../deps';
import { Roles } from '../../../../interfaces/Enum/roles';
import { INewSection } from '../../../../interfaces/Sections/sections';
import RumbleService from '../../../../services/rumble';
import authHandler from '../../../middlewares/authHandler';
import validate from '../../middlewares/validate';

const route = Router();

export default (app: IRouter) => {
  const logger: log.Logger = serviceCollection.get('logger');
  const rumbleServiceInstance = serviceCollection.get(RumbleService);
  app.use('/teachers', route);

  // GET /teachers/:teacherId/sections returns ISection[]
  route.get(
    '/:teacherId/sections',
    authHandler({ roles: [Roles.admin, Roles.teacher] }),
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

  // TODO 409 foreign key conflict
  // TODO None for gradeId retrns 400
  route.post(
    '/:teacherId/sections',
    authHandler({ roles: [Roles.admin, Roles.teacher] }),
    validate<INewSection>({
      name: [required, isString],
      gradeId: [required, isString],
      subjectId: [required, isString],
    }),
    async (req, res) => {
      try {
        const newSection = await rumbleServiceInstance.createSection(
          req.body,
          parseInt(req.params.teacherId, 10)
        );
        res.setStatus(201).json(newSection);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  route.post(
    '/:teacherId/rumbles',
    authHandler({ roles: [Roles.teacher, Roles.admin] }),
    validate({
      rumble: validateObject(true, {
        numMinutes: [required, isNumber, minNumber(1)],
        promptId: [required, isNumber, minNumber(1)],
      }),
      sectionIds: validateArray(true, [isNumber, minNumber(1)], {
        minLength: 1,
      }),
    }),
    async (req, res) => {
      try {
        const rumble = await rumbleServiceInstance.createGameInstances({
          rumble: req.body.rumble,
          sectionIds: req.body.sectionIds,
        });
        res.setStatus(201).json(rumble);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  console.log('Rumble teacher route loaded.');
};
