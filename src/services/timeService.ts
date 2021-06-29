import { Service, serviceCollection } from '../../deps';
import BaseService from './baseService';

Service();
export default class TimeService extends BaseService {
  constructor() {
    super();
  }
}

serviceCollection.addTransient(TimeService);
