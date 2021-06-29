import express from 'express';
import loaders from './loaders';

export default async function initializeServer() {
  const app = express();

  await loaders({ expressApp: app });
  console.log('Loaders complete.');

  return app;
}
