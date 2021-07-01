import express from 'express';
import loaders from './loaders';

export default async function app__init() {
  const app = express();

  await loaders({ expressApp: app });

  return app;
}
