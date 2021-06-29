import 'reflect-metadata';
import initializeServer from './app';
import env from './config/env';

export async function startServer(): Promise<void> {
  const server = await initializeServer();

  server.listen(env.PORT, () => {
    console.log(`== Server listening on port ${env.PORT} ==`);
  });
}

startServer();
