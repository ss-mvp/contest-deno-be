import { HandlebarsConfig } from './deps';
import helpers from './views/helpers';

export default () => {
  const hbc: HandlebarsConfig = {
    extname: '.hbs',
    baseDir: 'views',
    defaultLayout: 'main',
    layoutsDir: 'layouts/',
    partialsDir: 'partials/',
    helpers: helpers,
    compilerOptions: undefined,
  };
  return hbc;
};
