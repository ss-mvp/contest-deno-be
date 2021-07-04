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
export default class BaseModel<
  NewItem,
  FullItem extends { id: number | string }
> {
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
    opts?: { first?: B } & ICustomKnexInstance
  ): Promise<B extends true ? FullItem : FullItem[]>;
  public async add(
    body: NewItem | NewItem[],
    opts?: { first?: boolean } & ICustomKnexInstance
  ): Promise<FullItem | FullItem[]> {
    this.logger.debug(`Attempting to add field to table ${this.tableName}`);
    const db = opts?.knex || this.db;
    const first = opts?.first ?? false;

    const response = await db(this.tableName).insert(body).returning('*');

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
    const db = config?.knex || this.db;

    const response = await db(this.tableName)
      .select('*')
      .modify((QB) => {
        if (filter) QB.where(filter);
        if (config?.ids) QB.whereIn('id', config.ids);
        if (config?.first) QB.limit(1).first();
        if (config?.limit) QB.limit(config.limit);
        if (config?.orderBy) QB.orderBy(config.orderBy, config?.order || 'ASC');
        if (config?.offset) QB.offset(config.offset);
      });

    return response;
  }

  // public async update(updatedItems: Partial<FullItem>[]): Promise<FullItem[]>;
  // public async update(
  //   idOrUpdates: number | Partial<FullItem> | Partial<FullItem>[],
  //   changes?: Partial<FullItem>
  // ): Promise<FullItem | FullItem[]> {
  //   this.logger.debug(`Attempting to retrieve one row from ${this.tableName}`);
  //   let singleReturn = true;

  //   if (Array.isArray(idOrUpdates)) {
  //     singleReturn = false;
  //   } else if (typeof idOrUpdates === 'number') {
  //     const id = idOrUpdates;
  //     const [response] = await this.db(this.tableName)
  //       .where({ id })
  //       .update(changes, '*');
  //   } else {
  //     const { id, ...changes } = idOrUpdates;
  //     const [response] = await this.db(this.tableName)
  //       .where('id', id)
  //       .update(changes, '*');
  //   }

  //   this.logger.debug(`Successfully updated row from ${this.tableName}`);
  //   return singleReturn ? response[0] : response;
  // } update(updatedItems: Partial<FullItem>[]): Promise<FullItem[]>;

  public async update(
    id: number,
    { knex, ...changes }: Partial<FullItem> & ICustomKnexInstance
  ): Promise<FullItem> {
    this.logger.debug(`Attempting to retrieve one row from ${this.tableName}`);
    const db = knex || this.db;

    const [response] = await db(this.tableName)
      .where({ id })
      .update(changes, '*');

    this.logger.debug(`Successfully updated row from ${this.tableName}`);
    return response;
  }

  public async delete(
    id: number,
    options?: ICustomKnexInstance
  ): Promise<void> {
    this.logger.debug(`Attempting to delete row ${id} from ${this.tableName}`);
    const db = options?.knex || this.db;

    await db(this.tableName).where({ id }).del();

    this.logger.debug(`Successfully deleted row ${id} from ${this.tableName}`);
  }
}

export interface IGetQuery<
  IsFirst = boolean,
  DataProperties = string,
  IdType = number
> extends ICustomKnexInstance {
  first?: IsFirst;
  limit?: number;
  offset?: number;
  orderBy?: DataProperties;
  order?: 'asc' | 'desc' | 'ASC' | 'DESC';
  ids?: IdType[];
}

export interface ICustomKnexInstance {
  knex?: Knex;
}
