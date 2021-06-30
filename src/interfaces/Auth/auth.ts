import { Users } from '..';

export interface IEnumData {
  grades: ISelectOption[];
  subjects: ISelectOption[];
}

export interface ISelectOption {
  value: string;
  label: string;
}

/**
 * Adds a `user` field onto your request body. This is the user added to the body when the
 * authHandler middleware is finished authorizing the request.
 */
export type WithHandler<T> = T & {
  __user: Users.ICleanUser;
};
