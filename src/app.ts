import express from 'express';
import { env } from './config';
import loaders from './loaders';

export default async function app__init() {
  const app = express();

  console.log(env);

  await loaders({ expressApp: app });

  return app;
}
