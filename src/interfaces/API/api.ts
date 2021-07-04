import { IUser } from '../users';
import { upload } from './middleware';

export type GetParams<
  OtherQueryParams = { __never: never },
  DataType = { id: number }
> = OtherQueryParams & {
  limit?: number;
  offset?: number;
  orderBy?: keyof DataType;
  order?: 'asc' | 'desc' | 'ASC' | 'DESC';
  first?: true | 'true';
  ids?: string;
};

/**
 * Adds a `__user` field onto your request body. This is the user added to the body when the
 * authHandler middleware is finished authorizing the request.
 *
 * We're adding the never property as a fallback to fix linting
 */
export type WithAuth<T = { __never: never }> = T & {
  __user: IUser;
};

export type WithId<
  T extends string | unknown = { __never: never }
> = (T extends string ? Record<T, number> : T) & {
  id: number;
};

export type WithUpload<FileNames extends string, T = { __never: never }> = T &
  Record<FileNames, upload.IResponseWithChecksum[]>;
