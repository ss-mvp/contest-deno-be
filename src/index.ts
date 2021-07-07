// Necessary for decorators
import 'reflect-metadata';
import app__init from './app';
import env from './config/env';

export async function server__listen(): Promise<void> {
  const server = await app__init();

  server.listen(env.PORT, () => {
    console.log(`== Server listening on port ${env.PORT} ==`);
  });
}

server__listen();
