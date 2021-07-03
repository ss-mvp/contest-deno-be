import { API } from '../../interfaces';

/**
 * Use this to generate your pagination query objects easily without
 * having to repeat formatting logic. Use with any GET endpoint that uses
 * the `get` method from the `BaseModel`.
 *
 * @param queryParams pass in `req.query`
 * @returns an options object for the second arg in `get` from `BaseModel`
 */
export default function parseGetQuery<T = { __never: never }>(
  queryParams: API.GetParams<T>
) {
  const idQuery = queryParams.ids;
  const idList =
    typeof idQuery === 'string'
      ? idQuery.split(',').map((id) => +id) // Split into a string array and cast those strings to ints
      : typeof idQuery === 'number'
      ? [idQuery]
      : undefined;

  return {
    limit: queryParams.limit,
    offset: queryParams.offset,
    orderBy: queryParams.orderBy || 'id',
    order: queryParams.order || 'ASC',
    ids: idList,
    first: queryParams.first === 'true' || queryParams.first === true,
  };
}
