# Contest Routes

These routes are likely specific to the FDSC/Classroom Rumble ecosystem and will not be used across other apps.

## Submissions: `/api/clash/submissions`

### Submission Endpoints

| Endpoint     | Method | Description                   | Request Body | Query Params       | Return         |
| ------------ | ------ | ----------------------------- | ------------ | ------------------ | -------------- |
| `/`          | POST   | Post an image submission      | `SubmitBody` | none               | `{ message }`  |
| `/`          | GET    | Get an array of submissions   | none         | `PaginationParams` | `ISubItem[]`   |
| `/:id`       | GET    | Get a submission by `id`      | none         | none               | `ISubItem`     |
| `/top`       | GET    | Get today's top 3 submissions | none         | none               | `ISubItem[]`   |
| `/top`       | POST   | Set today's top 3 (admin)     | `SetTop3`    | none               | `Top3Response` |
| `/winner`    | GET    | Get the most recent winner    | none         | none               | `ISubItem`     |
| `/:id/flags` | GET    | Get flags for sub with `id`   | none         | none               | `string[]`     |
| `/:id/flags` | POST   | Add flags to sub with `id`    | `AddFlags`   | none               | `string[]`     |

### Submission Request Data Types

| Type           | Values                                                   |
| -------------- | -------------------------------------------------------- |
| `SubmitBody`   | `FormData`: `{ story: File, promptId: number }`          |
| `ISubItem`     | `{ id, userId, codename, src, rotation, prompt, score }` |
| `SetTop3`      | `{ ids: number[] }`                                      |
| `Top3Response` | `{ top3: [], message }`                                  |
| `AddFlags`     | `{ flags: number[] }`                                    |

## Prompts: `/api/clash/prompts`

### Prompt Endpoints

| Endpoint  | Method | Description                                      | Request Body       | Query Params       | Return           |
| --------- | ------ | ------------------------------------------------ | ------------------ | ------------------ | ---------------- |
| `/`       | GET    | Get a list of prompts (ordered and paginated)    | none               | `PaginationParams` | `IPrompt[]`      |
| `/`       | POST   | Add a new prompt                                 | `{ prompt }`       | none               | `IPrompt`        |
| `/:id`    | GET    | Get a prompt with specified `id`                 | none               | none               | `IPrompt`        |
| `/:id`    | PUT    | Update a prompt with the specified `id`          | `Partial<IPrompt>` | none               | none             |
| `/:id`    | DELETE | Delete a prompt with the specified `id`          | none               | none               | none             |
| `/active` | GET    | Get the current active prompt                    | none               | none               | `IPrompt`        |
| `/active` | PUT    | Triggers service to update current active prompt | none               | none               | none             |
| `/queue`  | GET    | Gets the current prompt queue                    | none               | none               | `IPromptQueue[]` |

### Prompt Request Data Types

| Type               | Values                                        |
| ------------------ | --------------------------------------------- |
| `PaginationParams` | `limit`, `offset`, `orderBy`, `order`,`first` |
| `IPromptQueue`     | `{ id, prompt, starts_at }`                   |

## Pagination Param Details

Paginated endpoints exist to reduce resource strain on the database. All of the values are optional and have a default when omitted. `limit` limits the amount of rows returned from the table, and `offset` skips a certain number of rows in a query. Used together, this allows you to query the database a section at a time. By paginating your databse requests, you speed up server requests and DB queries.

| Field     | Type                                         | Default     |
| --------- | -------------------------------------------- | ----------- |
| `limit`   | `number`                                     | `10`        |
| `offset`  | `number`                                     | `0`         |
| `orderBy` | `string` (MUST be names of a database field) | `'id'`      |
| `order`   | 'ASC' or 'DESC'                              | `'ASC'`     |
| `first`   | 'true' or `undefined`                        | `undefined` |
