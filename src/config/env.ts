import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { LoggerOptions } from 'winston';

export type envTypes = 'development' | 'production' | 'testing' | 'ci';
const NODE_ENV = (process.env.NODE_ENV as envTypes) || 'development';
dotenv.config({
  // Enable debugging in dev and test envs
  debug: ['development', 'testing'].includes(NODE_ENV),
  path: '../../.env',
});
const PORT = process.env['PORT'] || '8000';

/**
 * Appends a prefix to certain ENV variables based on the NODE_ENV
 * @param enableDevLabel allows to optionally enable the DEV label for env fields
 * @returns and env prefix string, 'TEST_', 'CI_', or 'DEV_'
 */
const envPrefix = (config?: { enableDevLabel?: boolean }): string => {
  switch (NODE_ENV) {
    case 'testing':
      return 'TEST_';
    case 'ci':
      return 'CI_';
    case 'development':
      if (config?.enableDevLabel) return 'DEV_';
      else return '';
    default:
      return '';
  }
};

const REACT_APP_URL = process.env['REACT_APP_URL'] || 'http://localhost:3000';
const DS_API_URL = process.env['DS_API_URL'] || '';
const DS_API_TOKEN = process.env['DS_API_TOKEN'] || '';

export default {
  NODE_ENV,
  REACT_APP_URL,
  PORT: parseInt(PORT, 10),
  UUID_NAMESPACE: process.env['UUID_NAMESPACE'] || '',
  SERVER_URL: process.env['SERVER_URL'] || 'http://localhost:' + PORT,
  DB_URL: process.env[envPrefix() + 'DB_URL'],

  // DS API Client Configuration
  DS_API_URL,
  DS_API_TOKEN,
  DS_API_CONFIG: {
    baseURL: DS_API_URL,
    headers: {
      Authorization: DS_API_TOKEN,
    },
  },
  // Dedicated DS Database Connection
  DS_DB_CONFIG: {
    database: process.env[envPrefix() + 'DS_DB_NAME'] || '',
    hostname: process.env[envPrefix() + 'DS_DB_HOST'] || '',
    port: parseInt(process.env[envPrefix() + 'DS_DB_PORT'] || '0', 10),
    username: process.env[envPrefix() + 'DS_DB_USER'] || '',
    password: process.env[envPrefix() + 'DS_DB_PASS'] || '',
  },

  // REDIS Config
  REDIS_CONFIG: {
    hostname: process.env['REDIS_HOST'],
    port: process.env['REDIS_PORT'],
  },

  // Time in days, defaults to 30 if not set in .env
  AUTH_TOKEN_EXP_TIME: parseInt(process.env['AUTH_TOKEN_EXP_TIME'] || '30', 10),

  DB_CONFIG: {
    database: process.env[envPrefix() + 'DB_NAME'] || '',
    hostname: process.env[envPrefix() + 'DB_HOST'] || '',
    port: parseInt(process.env[envPrefix() + 'DB_PORT'] || '0', 10),
    username: process.env[envPrefix() + 'DB_USER'] || '',
    password: process.env[envPrefix() + 'DB_PASS'] || '',
  },
  AWS_CONFIG: {
    credentials: {
      accessKeyId: process.env['AWS_ACCESS_KEY_ID'] || '',
      secretAccessKey: process.env['AWS_SECRET_KEY'] || '',
    },
    region: process.env['S3_REGION'] || '',
  } as AWS.ConfigurationOptions,
  SES_EMAIL: `"Story Squad" <${process.env['SES_EMAIL'] || ''}>`,
  SES_CONFIG: {},
  // By having a dev label we can restrict pushing to main s3 bucket from DEV env
  S3_BUCKET:
    process.env[envPrefix({ enableDevLabel: true }) + 'S3_BUCKET'] || '',
  JWT: {
    SECRET: process.env['JWT_SECRET'] || 'somefakesecret',
    ALGO: process.env['JWT_ALGORITHM'] || 'HS512',
  },
  CLEVER_CONFIG: {
    clientId: process.env['CLEVER_CLIENT_ID'] || '',
    clientSecret: process.env['CLEVER_CLIENT_SECRET'] || '',
    redirectURI: REACT_APP_URL + (process.env['CLEVER_REACT_APP_EP'] || ''),
  },

  LOGGER_CONFIG: {
    level:
      process.env['LOGGER_LEVEL'] || NODE_ENV === 'development'
        ? 'debug'
        : 'info',
  } as LoggerOptions,
};
