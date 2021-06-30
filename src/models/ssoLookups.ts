import { Service } from 'typedi';
import { SSOLookups } from '../interfaces';
import BaseModel from './baseModel';

@Service()
export default class SSOLookupModel extends BaseModel<
  SSOLookups.INewSSOLookup,
  SSOLookups.ISSOLookup
> {
  constructor() {
    super('sso_lookup');
  }
}
