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

  // Handle the dependancy injection first
  await dependencyInjector__loader();

  // Then we load the server
  expressMiddleware__loader(expressApp);
  errorHandler__routes(expressApp);

  console.log('Loaders complete.');
}
