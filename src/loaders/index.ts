import { Express } from 'express';
import dependencyInjector from './dependencyInjector';
import errorHandlers from './errorHandlers';
import addExpressMiddleware from './express';

export default async function dependencyAndMiddlewareLoader({
  expressApp,
}: {
  expressApp: Express;
}) {
  console.log('Running loaders...');
  await dependencyInjector();
  addExpressMiddleware(expressApp);
  errorHandlers(expressApp);
}
