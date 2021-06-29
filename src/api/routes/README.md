# Routes

This server application has been built with multiple applications in mind. All applications will share the same `/auth` and `/user` routes to improve auth across our various apps.

## Pagination Param Details

Paginated endpoints exist to reduce resource strain on the database. All of the values are optional and have a default when omitted. `limit` limits the amount of rows returned from the table, and `offset` skips a certain number of rows in a query. Used together, this allows you to query the database a section at a time. By paginating your databse requests, you speed up server requests and DB queries.

| Field     | Type                                         | Default     |
| --------- | -------------------------------------------- | ----------- |
| `limit`   | `number`                                     | `10`        |
| `offset`  | `number`                                     | `0`         |
| `orderBy` | `string` (MUST be names of a database field) | `'id'`      |
| `order`   | 'ASC' or 'DESC'                              | `'ASC'`     |
| `first`   | 'true' or `undefined`                        | `undefined` |
