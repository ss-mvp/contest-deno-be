import { Users } from '..';

export interface IAuthResponse {
  user: Omit<Users.IUser, 'password'>;
  token: string;
}
