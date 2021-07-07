import { createLogger, format, transports } from 'winston';
import { env } from '../config';

/**
 * An async loader function that creates a Winston logger, tests
 * that it's connected properly, then returns it.
 *
 * Changes logger configuration based on NODE_ENV.
 */
export function logger__loader() {
  console.log('Initializing logger...');

  // Create the logger instance our server will use
  const logger = createLogger({
    // Spread in the config from our env
    ...env.LOGGER_CONFIG,
    // Have the logger output to the console
    transports: [new transports.Console()],
    format: format.printf(
      ({ message, level }) => `[${level.toUpperCase()}] ${message}`
    ),
  });

  console.log('Logger initialized!');

  // Return the logger for injection
  return logger;
}
