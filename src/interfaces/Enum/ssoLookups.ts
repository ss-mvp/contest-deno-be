export interface ISSOLookup extends INewSSOLookup {
  id: number;
}

export interface INewSSOLookup {
  accessToken: string;
  providerId: SSOLookups & number;
  userId: number;
}

export enum SSOLookups {
  'Clever' = 1,
}
