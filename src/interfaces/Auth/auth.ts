import { Users } from '..';

/**
 * Adds a `user` field onto your request body. This is the user added to the body when the
 * authHandler middleware is finished authorizing the request.
 *
 * We're adding the never property just as a default sort of thing
 */
export type WithHandler<T = { __never: never }> = T & {
  __user: Users.IUser;
};
