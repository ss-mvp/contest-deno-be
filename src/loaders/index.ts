import { Express } from 'express';
import dependencyInjector__loader from './dependencyInjector';
import errorHandler__routes from './errorHandlers';
import expressMiddleware__loader from './express';

export default async function dependencyAndMiddlewareLoader({
  expressApp,
}: {
  expressApp: Express;
}) {
  console.log('Running loaders...');

  await dependencyInjector__loader();
  expressMiddleware__loader(expressApp);
  errorHandler__routes(expressApp);

  console.log('Loaders complete.');
}
