export interface ISSOLookup extends INewSSOLookup {
  id: number;
}

export interface INewSSOLookup {
  accessToken: string;
  providerId: LookupEnum & number;
  userId: number;
}

export enum LookupEnum {
  'Clever' = 1,
}
