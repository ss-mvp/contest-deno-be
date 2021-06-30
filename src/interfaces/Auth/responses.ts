import { IUser } from '../users';

export interface IAuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}
