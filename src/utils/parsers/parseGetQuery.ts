import { API } from '../../interfaces';
import { IGetQuery } from '../../models/baseModel';

/**
 * Use this to generate your pagination query objects easily without
 * having to repeat formatting logic. Use with any GET endpoint that uses
 * the `get` method from the `BaseModel`.
 *
 * @param queryParams pass in `req.query`
 * @returns an options object for the second arg in `get` from `BaseModel`
 */
export default function parseGetQuery<
  DataType extends { id: number },
  T = { __never: never }
>(
  queryParams: API.GetParams<T>,
  defaults?: {
    limit?: number;
    offset?: number;
    orderBy?: keyof DataType;
    order: 'ASC' | 'DESC';
  }
): IGetQuery<boolean, keyof DataType | 'id'> {
  const idQuery = queryParams.ids;
  const idList =
    typeof idQuery === 'string' // if it's a string,
      ? idQuery.split(',').map((id) => +id) // Split into a string array and cast those strings to ints
      : typeof idQuery === 'number' // otherwise if they just passed a number
      ? [idQuery] // add the number to an array
      : undefined; // otherwise, set nothing

  return {
    limit: queryParams.limit || defaults?.limit || 10, // Try to keep server loads light wherever possible
    offset: queryParams.offset || defaults?.offset,
    orderBy: queryParams.orderBy || defaults?.orderBy || 'id',
    order: queryParams.order || defaults?.order || 'ASC',
    ids: idList,
    first: queryParams.first === 'true' || queryParams.first === true,
  };
}
