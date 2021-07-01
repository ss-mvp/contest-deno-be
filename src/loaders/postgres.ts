import knex from 'knex';
import { env, knexfile } from '../config';

export async function mainDB__loader() {
  console.log('Connecting to DB...');

  try {
    const db = knex(knexfile[env.NODE_ENV]);

    console.log('Testing DB connection...');
    await db.from('users').select();

    console.log('DB connected!');

    return db;
  } catch (err) {
    console.log(env.DB_CONFIG);
    console.log(err.message, err);
  }
}

export async function dsDB__loader() {
  console.log('Connecting to DS DB...');

  try {
    const db = knex(knexfile['ds']);

    console.log('Testing DS DB connection...');
    await db.from('submissions').select();

    console.log('DS DB connected!');

    return db;
  } catch (err) {
    console.log(env.DS_DB_CONFIG);
    console.log(err.message, err);
  }
}
