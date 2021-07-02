import { Users } from '..';

export type WithPaging<
  OtherQueryParams = { __never: never },
  DataType = { id: number }
> = OtherQueryParams & {
  limit?: number;
  offset?: number;
  orderBy?: keyof DataType;
  order?: 'asc' | 'desc' | 'ASC' | 'DESC';
  first?: true | 'true';
};

/**
 * Adds a `__user` field onto your request body. This is the user added to the body when the
 * authHandler middleware is finished authorizing the request.
 *
 * We're adding the never property as a fallback to fix linting
 */
export type WithAuth<T = { __never: never }> = T & {
  __user: Users.IUser;
};

export type WithId<T = { __never: never }> = T & {
  id: number;
};
