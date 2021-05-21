// Opine v1.0.2
// logger @0.83.0
export * as log from 'https://deno.land/std@0.83.0/log/mod.ts';
// uuid v0.83.0
export { v4, v5 } from 'https://deno.land/std@0.83.0/uuid/mod.ts';
// AWS SES client v0.01
export {
  SendEmailCommand,
  SESv2Client as SES,
} from 'https://deno.land/x/aws_sdk@v0.0.1/client-sesv2/mod.ts';
export type { SendEmailRequest } from 'https://deno.land/x/aws_sdk@v0.0.1/client-sesv2/mod.ts';
// bcrypt v0.2.4
export * as bcrypt from 'https://deno.land/x/bcrypt@v0.2.4/mod.ts';
// clever
export { CleverClient } from 'https://deno.land/x/clever_sso_deno@v0.0.47/mod.ts';
export type {
  CleverGradeType,
  CleverSubjectType,
  ICleverProfile,
  ICleverUserInfo,
} from 'https://deno.land/x/clever_sso_deno@v0.0.47/mod.ts';
// cors @1.2.1
export { opineCors } from 'https://deno.land/x/cors@v1.2.1/mod.ts';
// Cotton v0.7.5
export {
  BelongsTo,
  Column,
  connect,
  DataType,
  HasMany,
  Model,
  Primary,
  Q,
  Schema,
} from 'https://deno.land/x/cotton@v0.7.5/mod.ts';
export type { Manager } from 'https://deno.land/x/cotton@v0.7.5/mod.ts';
export type {
  Adapter,
  DatabaseResult,
} from 'https://deno.land/x/cotton@v0.7.5/src/adapters/adapter.ts';
export type { PostgresAdapter } from 'https://deno.land/x/cotton@v0.7.5/src/adapters/postgres.ts';
export type {
  OrderDirection,
  QueryValues,
} from 'https://deno.land/x/cotton@v0.7.5/src/querybuilder.ts';
export { Inject, Service } from 'https://deno.land/x/di@v0.1.1/mod.ts';
export type { Algorithm } from 'https://deno.land/x/djwt@v2.0/algorithm.ts';
// djwt @v2.0
export * as jwt from 'https://deno.land/x/djwt@v2.0/mod.ts';
// dotenv v2.0.0
export { config } from 'https://deno.land/x/dotenv@v2.0.0/mod.ts';
// event @0.2.1
export { EventEmitter } from 'https://deno.land/x/event@0.2.1/mod.ts';
// handlebars v0.6.0
export { Handlebars } from 'https://deno.land/x/handlebars@v0.6.0/mod.ts';
export type { HandlebarsConfig } from 'https://deno.land/x/handlebars@v0.6.0/mod.ts';
// http-errors @3.0.0
export { createError } from 'https://deno.land/x/http_errors@3.0.0/mod.ts';
export type { IError } from 'https://deno.land/x/http_errors@3.0.0/mod.ts';
// media_types v2.7.0
export { extension } from 'https://deno.land/x/media_types@v2.7.0/mod.ts';
export { default as moment } from 'https://deno.land/x/momentjs@2.29.1-deno/mod.ts';
// multiparser @v2.0.3
export { multiParser } from 'https://deno.land/x/multiparser@v2.0.3/mod.ts';
export type {
  Form,
  FormFile,
} from 'https://deno.land/x/multiparser@v2.0.3/mod.ts';
export {
  json,
  opine,
  Router,
  urlencoded,
} from 'https://deno.land/x/opine@1.0.2/mod.ts';
export type {
  IRouter,
  NextFunction,
  Opine,
  Request,
  Response,
} from 'https://deno.land/x/opine@1.0.2/mod.ts';
// deno_s3 @0.3.0
export { S3Bucket } from 'https://deno.land/x/s3@0.3.0/mod.ts';
export type {
  DeleteObjectOptions,
  DeleteObjectResponse,
  GetObjectOptions,
  GetObjectResponse,
  PutObjectOptions,
  PutObjectResponse,
} from 'https://deno.land/x/s3@0.3.0/mod.ts';
export { sha512 } from 'https://deno.land/x/sha512@v1.0.3/mod.ts';
// validasaur v0.15.0
export {
  firstMessages,
  flattenMessages,
  isArray,
  isBool,
  isEmail,
  isIn,
  isNumber,
  isString,
  match,
  maxLength,
  minLength,
  minNumber,
  required,
  validate,
  validateArray,
  validateObject,
} from 'https://deno.land/x/validasaur@v0.15.0/mod.ts';
export type {
  Rule,
  ValidationResult,
  ValidationRules,
} from 'https://deno.land/x/validasaur@v0.15.0/mod.ts';
// axiod v0.21
export { axiod };
import axiod from 'https://deno.land/x/axiod@0.21/mod.ts';
import { ServiceCollection } from 'https://deno.land/x/di@v0.1.1/mod.ts';

export const serviceCollection = new ServiceCollection();
