import { IUser } from '../users';

export interface IAuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}

export interface IEnumData {
  grades: ISelectOption[];
  subjects: ISelectOption[];
}

export interface ISelectOption {
  value: string;
  label: string;
}
