import { ICleverProfile } from '../../deps';
import { Roles } from './roles';
import { IUser } from './users';

export interface IAuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}

export interface ICleverEnumData {
  grades: ISelectOption[];
  subjects: ISelectOption[];
}

export interface ISelectOption {
  value: string;
  label: string;
}

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

export type CleverAuthResponseType =
  | {
      actionType: 'SUCCESS';
      roleId: Roles & number;
      body: IAuthResponse;
      cleverId: string;
    }
  | {
      actionType: 'MERGE';
      roleId: Roles & number;
      body: IUser;
      cleverId: string;
    }
  | {
      actionType: 'NEW';
      roleId: Roles & number;
      body: ICleverProfile['data'];
      cleverId: string;
    };
