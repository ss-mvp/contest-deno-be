import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { Algorithm } from 'jsonwebtoken';
import { join } from 'path';
import { LoggerOptions } from 'winston';
import { Clever } from '../interfaces';

export type envTypes = 'development' | 'production' | 'testing' | 'ci';
const NODE_ENV = (process.env.NODE_ENV as envTypes) || 'development';
dotenv.config();
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

// HBS Config
const HBS_TEMPLATE_DIR = process.env['HBS_TEMPLATE_DIR'] || '/templates/email';
const HBS_FILE_EXT = process.env['HBS_FILE_EXT'] || '.hbs';

export default {
  NODE_ENV,
  REACT_APP_URL,
  PORT: +PORT,
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
    port: +(process.env[envPrefix() + 'DS_DB_PORT'] || 0),
    username: process.env[envPrefix() + 'DS_DB_USER'] || '',
    password: process.env[envPrefix() + 'DS_DB_PASS'] || '',
  },

  // REDIS Config
  REDIS_CONFIG: {
    hostname: process.env['REDIS_HOST'],
    port: process.env['REDIS_PORT'],
  },

  // Time in days, defaults to 30 if not set in .env
  AUTH_TOKEN_EXP_TIME: +(process.env['AUTH_TOKEN_EXP_TIME'] || 30),

  DB_CONFIG: {
    database: process.env[envPrefix() + 'DB_NAME'] || '',
    hostname: process.env[envPrefix() + 'DB_HOST'] || '',
    port: +(process.env[envPrefix() + 'DB_PORT'] || 0),
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
  SES_CONFIG: {
    EMAIL: process.env['SES_EMAIL'] || '',
    NAME: 'Story Squad',
  },
  S3_BUCKET: process.env[envPrefix() + 'S3_BUCKET'] || '',
  JWT: {
    SECRET: process.env['JWT_SECRET'] || 'somefakesecret',
    ALGO: (process.env['JWT_ALGORITHM'] || 'HS512') as Algorithm,
  },
  CLEVER_CONFIG: {
    clientId: process.env['CLEVER_CLIENT_ID'] || '',
    clientSecret: process.env['CLEVER_CLIENT_SECRET'] || '',
    redirectURI: REACT_APP_URL + (process.env['CLEVER_REACT_APP_EP'] || ''),
  } as Clever.client.IConfig,

  LOGGER_CONFIG: {
    level:
      process.env['LOGGER_LEVEL'] || NODE_ENV === 'development'
        ? 'debug'
        : 'info',
  } as LoggerOptions,

  // Shouldn't need to set these in env, just being consistent and making it easy if you want to move stuff
  HBS_CONFIG: {
    viewEngine: {
      extName: HBS_FILE_EXT,
      // Will default to a /partials folder inside of your main views/templates folder
      partialsDir:
        process.env['HBS_PARTIAL_PATH_DIR'] ||
        join(HBS_TEMPLATE_DIR, '/partials'),
      // Will default to a /layouts folder inside of your main views/templates folder
      layoutsDir:
        process.env['HBS_LAYOUT_PATH_DIR'] ||
        join(HBS_TEMPLATE_DIR, '/layouts'),
      // Defaults to 'main'
      defaultLayout: process.env['HBS_DEFAULT_LAYOUT'] || 'main',
    },
    viewPath: HBS_TEMPLATE_DIR,
    extName: HBS_FILE_EXT,
  },
};
