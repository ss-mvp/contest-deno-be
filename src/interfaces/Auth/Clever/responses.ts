import { Roles } from '../../Enum';
import { IUser } from '../../users';
import { IAuthResponse } from '../auth';
import { IProfile } from './api';

/**
 * # Clever Auth Response
 *
 * This response has three different data types depending on the
 * user's state in regards to our server. The body will always have
 * the same structure:
 *
 * ```ts
 * {
 *   actionType: 'SUCCESS' | 'MERGE' | 'NEW';
 *   roleId: Roles & number
 *   body: object
 * }
 * ```
 *
 * ## Response Types
 *
 * The different types correspond to the various states that pertain
 * to a user's status in our database. The different states are
 * documented below.
 *
 * ### `SUCCESS`
 *
 * The success type indicates that the user has already completed
 * our signup flow and has been successfully authenticated. Store
 * their token in `localStorage` and route them to the correct
 * dashboard based on the `actionType` property received.
 *
 * ### `MERGE`
 *
 * The merge type indicates that the user's email from clever has
 * an account in our `users` table already. The account is just not
 * linked to their clever ID yet. We need to merge the two accounts.
 *
 * ### `NEW`
 *
 * The user doesn't have any info in our database, and as such they
 * need to complete our onboarding. Their clever info is provided to
 * auto-populate the signup form on the frontend in an effort to
 * reduce friction and improve the user experience.
 */

export interface ISuccessResponse {
  actionType: 'SUCCESS';
  roleId: Roles.RoleEnum & number;
  body: IAuthResponse;
  cleverId: string;
}
export function isSuccess(res: unknown): res is ISuccessResponse {
  return (res as ISuccessResponse)?.actionType === 'SUCCESS';
}

export interface IMergeResponse {
  actionType: 'MERGE';
  roleId: Roles.RoleEnum & number;
  body: IUser;
  cleverId: string;
}
export function isMerge(res: unknown): res is IMergeResponse {
  return (res as IMergeResponse)?.actionType === 'MERGE';
}

export interface INewResponse {
  actionType: 'NEW';
  roleId: Roles.RoleEnum & number;
  body: IProfile['data'];
  cleverId: string;
}
export function isNew(res: unknown): res is INewResponse {
  return (res as INewResponse)?.actionType === 'NEW';
}

export type IResponse = ISuccessResponse | IMergeResponse | INewResponse;
