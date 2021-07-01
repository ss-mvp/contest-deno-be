import { createLogger, format, transports } from 'winston';
import { env } from '../config';

export default function logger__loader() {
  console.log('Initializing logger...');

  const logger = createLogger({
    ...env.LOGGER_CONFIG,
    format: format.printf(({ level, message }) => {
      return `[${level}] ${message}`;
    }),
    transports: [new transports.Console()],
  });

  console.log('Logger initialized!');

  return logger;
}
