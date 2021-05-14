import { Algorithm, config } from '../../deps.ts';

config({ export: true });

export type envTypes = 'development' | 'production' | 'testing' | 'ci';
const PORT = Deno.env.get('PORT') || '8000';
const DENO_ENV = (Deno.env.get('DENO_ENV') || 'development') as envTypes;

const envPrefix = () => {
  switch (DENO_ENV) {
    case 'testing':
      return 'TEST_';
    case 'ci':
      return 'CI_';
    default:
      return '';
  }
};

const REACT_APP_URL = Deno.env.get('REACT_APP_URL') || 'http://localhost:3000';

export default {
  DENO_ENV: DENO_ENV === 'ci' ? 'testing' : DENO_ENV,
  PORT: parseInt(PORT, 10),
  UUID_NAMESPACE: Deno.env.get('UUID_NAMESPACE') || '',
  SERVER_URL: Deno.env.get('SERVER_URL') || 'http://localhost:' + PORT,
  DB_URL: Deno.env.get(envPrefix() + 'DB_URL'),
  REACT_APP_URL,
  DB_CONFIG: {
    database: Deno.env.get(envPrefix() + 'DB_NAME') || '',
    hostname: Deno.env.get(envPrefix() + 'DB_HOST') || '',
    port: parseInt(Deno.env.get(envPrefix() + 'DB_PORT') || '0', 10),
    username: Deno.env.get(envPrefix() + 'DB_USER') || '',
    password: Deno.env.get(envPrefix() + 'DB_PASS') || '',
  },
  SES_CONFIG: {
    credentials: {
      accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
      secretAccessKey: Deno.env.get('AWS_SECRET_KEY') || '',
    },
    region: Deno.env.get('S3_REGION') || '',
    // email: Deno.env.get('SES_EMAIL') || '',
    email: `"Story Squad" <${Deno.env.get('SES_EMAIL') || ''}>`,
  },
  S3_CONFIG: {
    accessKeyID: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
    secretKey: Deno.env.get('AWS_SECRET_KEY') || '',
    bucket: Deno.env.get('S3_BUCKET') || '',
    region: Deno.env.get('S3_REGION') || '',
  },
  JWT: {
    SECRET: Deno.env.get('JWT_SECRET') || 'somefakesecret',
    ALGO: (Deno.env.get('JWT_ALGORITHM') as Algorithm) || 'HS512',
  },
  CLEVER_CONFIG: {
    clientId: Deno.env.get('CLEVER_CLIENT_ID') || '',
    clientSecret: Deno.env.get('CLEVER_CLIENT_SECRET') || '',
    redirectURI: REACT_APP_URL + (Deno.env.get('CLEVER_REACT_APP_EP') || ''),
  },
};
