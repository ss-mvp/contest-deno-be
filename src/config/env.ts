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
const HBS_TEMPLATE_DIR = process.env['HBS_TEMPLATE_DIR'] || 'templates/email';
const HBS_FILE_EXT = process.env['HBS_FILE_EXT'] || '.hbs';

export default {
  NODE_ENV,
  REACT_APP_URL,
  PORT: +PORT,
  SERVER_URL: process.env['SERVER_URL'] || 'http://localhost:' + PORT,
  DB_URL: process.env[envPrefix() + 'DB_URL'],

  // Potentially Handy Levers

  /** Lockout for new validation email in minutes, defaults to 10 */
  VALIDATION_EMAIL_LOCKOUT: +(process.env['VALIDATION_EMAIL_LOCKOUT'] || 10),
  /** UUID library namespace for uid generation (should be a valid uuid) */
  UUID_NAMESPACE: process.env['UUID_NAMESPACE'] || '',
  /** Time in days, defaults to 30 if not set in .env */
  AUTH_TOKEN_EXP_TIME: +(process.env['AUTH_TOKEN_EXP_TIME'] || 30),

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

  DB_CONFIG: {
    database: process.env[envPrefix() + 'DB_NAME'] || '',
    hostname: process.env[envPrefix() + 'DB_HOST'] || '',
    port: +(process.env[envPrefix() + 'DB_PORT'] || 0),
    username: process.env[envPrefix() + 'DB_USER'] || '',
    password: process.env[envPrefix() + 'DB_PASS'] || '',
  },

  // AWS Configuration
  AWS_CONFIG: {
    credentials: {
      accessKeyId: process.env['AWS_ACCESS_KEY_ID'] || '',
      secretAccessKey: process.env['AWS_SECRET_KEY'] || '',
    },
    region: process.env['S3_REGION'] || '',
  } as AWS.ConfigurationOptions,
  SES_SOURCE: `Story Squad <${process.env['SES_EMAIL'] || ''}>`,
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

  // Handlebars Render Engine Configuration
  HBS_CONFIG: {
    viewPath: HBS_TEMPLATE_DIR,
    extName: HBS_FILE_EXT,
    extname: HBS_FILE_EXT,
  },
  HBS_VIEW_ENGINE_CONFIG: {
    // Will default to a /partials folder inside of your main templates folder
    partialsDir:
      process.env['HBS_PARTIAL_PATH_DIR'] || join(HBS_TEMPLATE_DIR, 'partials'),
    // Will default to a /layouts folder inside of your main views/templates folder
    layoutsDir:
      process.env['HBS_LAYOUT_PATH_DIR'] || join(HBS_TEMPLATE_DIR, 'layouts'),
    // Defaults to 'main'
    defaultLayout: process.env['HBS_DEFAULT_LAYOUT'] || 'main',
  },
};
