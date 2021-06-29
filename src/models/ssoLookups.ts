import { Service, serviceCollection } from '../../deps';
import { INewSSOLookup, ISSOLookup } from '../interfaces/ssoLookups';
import BaseModel from './baseModel';

@Service()
export default class SSOLookupModel extends BaseModel<
  INewSSOLookup,
  ISSOLookup
> {
  constructor() {
    super('sso_lookup');
  }
}

serviceCollection.addTransient(SSOLookupModel);
