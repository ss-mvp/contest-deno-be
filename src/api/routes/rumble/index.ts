import { IRouter, Router } from '../../../../deps';
import data from './data';
import feedback from './feedback';
import rumbles from './rumbles';
import sections from './sections';
import students from './students';
import teachers from './teachers';

export default (app: IRouter) => {
  console.log('Loading rumble routers...');
  const rumbleRouter = Router();
  app.use('/rumble', rumbleRouter);

  teachers(rumbleRouter);
  students(rumbleRouter);
  sections(rumbleRouter);
  rumbles(rumbleRouter);
  data(rumbleRouter);
  feedback(rumbleRouter);

  console.log('Rumble routers loaded.');
};
