import cors from 'cors';
import { Express, json, urlencoded } from 'express';
import { DateTime } from 'luxon';
import Container from 'typedi';
import { Logger } from 'winston';

export default function expressMiddleware__loader(app: Express) {
  const logger: Logger = Container.get('logger');
  // Log all API calls to the server
  app.use((req, res, next) => {
    const now = DateTime.utc();
    logger.debug(`[${req.method}] ${req.path} (${req.ip})[${now.toString()}]`);
    next();
  });

  // Test Endpoints
  app.get('/', (req, res) => {
    logger.debug('HEAD 200 Test hit.');
    res.status(200).json({ message: 'API up!' });
  });
  app.get('/status', (req, res) => {
    logger.debug('GET 200 Test hit.');
    res.status(200).json({ message: 'API up!' });
  });

  // Middleware
  app.use(json());
  app.use(cors());
  app.use(urlencoded({ extended: false }));

  // App Routes
  // app.use('/api', appRoute__loader());
}
