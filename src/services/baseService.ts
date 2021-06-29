import { log, PostgresAdapter, serviceCollection } from '../../deps';

export default class BaseService {
  constructor() {
    this.db = serviceCollection.get('pg');
    this.logger = serviceCollection.get('logger');
  }
  protected db: PostgresAdapter;
  protected logger: log.Logger;
}
