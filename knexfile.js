const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DB_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/db/migrations',
    },
    seeds: {
      directory: './src/db/seeds',
    },
  },
  testing: {
    client: 'pg',
    connection: process.env.TEST_DB_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/db/migrations',
    },
    seeds: {
      directory: './src/db/seeds',
    },
  },
  ci: {
    client: 'pg',
    connection: process.env.CI_DB_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/db/migrations',
    },
    seeds: {
      directory: './src/db/seeds',
    },
  },
  production: {
    client: 'pg',
    connection: process.env.RDS_DB_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/db/migrations',
    },
    seeds: {
      directory: './src/db/production_seeds',
    },
  },

  // DS Database connection
  ds: {
    client: 'pg',
    // TODO think about how we should set up the TEST db url?
    connection: process.env.DS_DB_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/db/dataScience/migrations',
    },
    seeds: {
      directory: './src/db/dataScience/seeds',
    },
  },
};
