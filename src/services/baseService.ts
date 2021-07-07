import Knex from 'knex';
import Container from 'typedi';
import { Logger } from 'winston';

export default class BaseService {
  constructor() {
    this.db = Container.get('pg');
    this.logger = Container.get('logger');
  }
  protected db: Knex;
  protected logger: Logger;
}
