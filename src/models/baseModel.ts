import Knex from 'knex';
import Container from 'typedi';
import { Logger } from 'winston';

/**
 * Type NewItem: new item interface, should be the fields required to
 * create a new item\
 * Type FullItem: complete item interface, all fields from the table
 *
 * This is important if you want good linting from member functions!
 */
export default class BaseModel<NewItem, FullItem> {
  constructor(tableName: string) {
    this.tableName = tableName;
    this.db = Container.get('pg');
    this.logger = Container.get('logger');
  }
  protected tableName: string;
  protected db: Knex;
  protected logger: Logger;

  // Putting basic CRUD operations on all Models

  // Overloading function call for better linting and usability :)
  public async add(body: NewItem | NewItem[]): Promise<FullItem[]>;
  public async add<B extends boolean>(
    body: NewItem | NewItem[],
    first?: B
  ): Promise<B extends true ? FullItem : FullItem[]>;
  public async add(
    body: NewItem | NewItem[],
    first?: boolean
  ): Promise<FullItem | FullItem[]> {
    this.logger.debug(`Attempting to add field to table ${this.tableName}`);
    const response = ((await this.db
      .table(this.tableName)
      .insert(body)
      .returning('*')
      .execute()) as unknown[]) as FullItem[];

    this.logger.debug(`Successfully added row to table ${this.tableName}`);
    return first ? response[0] : response;
  }

  public async get<B extends false, K extends keyof FullItem>(
    filter?: Partial<FullItem> | undefined,
    config?: IGetQuery<B | undefined, K>
  ): Promise<FullItem[]>;
  public async get<B extends boolean, K extends keyof FullItem>(
    filter?: undefined,
    config?: IGetQuery<B, K>
  ): Promise<B extends true ? FullItem : FullItem[]>;
  public async get<B extends false, K extends keyof FullItem>(
    filter?: Partial<FullItem>,
    config?: IGetQuery<B, K>
  ): Promise<FullItem[]>;
  public async get<B extends boolean, K extends keyof FullItem>(
    filter?: Partial<FullItem>,
    config?: IGetQuery<B, K>
  ): Promise<B extends true ? FullItem : FullItem[]>;
  public async get(
    filter?: Partial<FullItem> | undefined,
    config?: IGetQuery
  ): Promise<FullItem | FullItem[]> {
    this.logger.debug(`Attempting to retrieve rows from ${this.tableName}`);

    const sql = this.db.table(this.tableName).select('*');

    // The library can only handle one where clause, the rest HAVE to be or statements,
    // this boolean lets us track if we have a where clause yet
    let hasWhere = false;
    const filters = Object.entries(filter || {});
    filters.forEach((fil) => {
      if (hasWhere) {
        sql.or(...fil);
      } else {
        sql.where(...fil);
        hasWhere = true;
      }
    });
    config?.ids?.forEach((id) => {
      if (hasWhere) {
        sql.or('id', id);
      } else {
        sql.where('id', id);
        hasWhere = true;
      }
    });
    if (config?.first) {
      sql.limit(1);
    }
    if (config?.limit) {
      sql.limit(config.limit);
    }
    if (config?.orderBy) {
      sql.order(config.orderBy as string, config?.order || 'ASC');
    }
    if (config?.offset) {
      sql.offset(config.offset);
    }
    const response = (await (sql.execute() as unknown)) as FullItem[];

    return config?.first ? response[0] : response;
  }

  public async update(
    id: number,
    changes: Partial<FullItem>
  ): Promise<FullItem> {
    this.logger.debug(`Attempting to retrieve one row from ${this.tableName}`);

    const [response] = ((await this.db
      .table(this.tableName)
      .where('id', id)
      .update(changes)
      .returning('*')
      .execute()) as unknown) as FullItem[];

    this.logger.debug(`Successfully updated row from ${this.tableName}`);
    return response;
  }

  public async delete(id: number): Promise<void> {
    this.logger.debug(`Attempting to delete row ${id} from ${this.tableName}`);

    await this.db.table(this.tableName).where('id', id).delete().execute();

    this.logger.debug(`Successfully deleted row ${id} from ${this.tableName}`);
  }
}

export interface IGetQuery<
  IsFirst = boolean,
  DataProperties = string,
  IdType = number
> {
  first?: IsFirst;
  limit?: number;
  offset?: number;
  orderBy?: DataProperties;
  order?: 'ASC' | 'DESC';
  ids?: IdType[];
}
