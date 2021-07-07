import { default as Knex, default as knex } from 'knex';
import { types } from 'pg';
import knexfile from '../../knexfile';
import { env } from '../config';

/**
 * An async loader function that creates a connection to the
 * Story Squad main contest database, tests the connection,
 * and returns it for injection
 */
export async function mainDB__loader() {
  console.log('Connecting to DB...');

  // Initialize our DS database connection
  const db = knex(knexfile[env.NODE_ENV]);

  // This prevents the starts_at Date type column to be returned as
  // a string 'yyyy-mm-dd' as it is stored, instead of as a Date
  // This is why starts_at can be a string in the interface
  types.setTypeParser(1082, (val) => val);

  try {
    console.log('Testing DB connection...');

    // Run a query to test the connection
    await db('users').first();

    // If it works, we're connected
    console.log('DB connected!');
  } catch (err) {
    /**
     * Most common errors -> how to fix:
     * - ENV not set -> set ENV :)
     * - table does not exist -> run migrations!
     */
    console.log('Error connecting to Main DB');
    console.log(err);
  }

  // Return the client for injection
  return db;
}

/**
 * An async loader function that creates a connection to the
 * Data Science transcription database, tests the connection,
 * and returns it for injection
 */
export async function dsDB__loader(): Promise<Knex> {
  console.log('Connecting to DS DB...');

  // Initialize our DS database connection
  const db = knex(knexfile['ds']);

  try {
    console.log('Testing DS DB connection...');

    // Run a query to test the connection
    await db('submissions').first();

    // If it works, we're connected
    console.log('DS DB connected!');
  } catch (err) {
    /**
     * Most common errors -> how to fix:
     * - ENV not set -> set ENV :)
     * - table does not exist -> run migrations!
     */
    console.log('Error connecting to DS DB');
    console.info(
      'This error will not cause crashes, but will prevent submissions to the Data Science database.'
    );
    console.log(err);
  }

  // Return the client for injection
  return db;
}
