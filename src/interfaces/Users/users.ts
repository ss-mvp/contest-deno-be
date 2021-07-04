import { Roles } from '../Enum';

export interface IUser extends Omit<INewUser, 'parentEmail'> {
  id: number;
  isValidated: boolean;
  codename: string;
  password: string;
  email: string;
  roleId: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICleanUser extends Omit<IUser, 'password'> {
  __clean: true;
}

export interface INewUser extends IOAuthUser {
  email?: string;
  roleId: Roles.RoleEnum & number;
  isValidated?: boolean;
  parentEmail?: string;
  dob?: Date | string;
}

export interface IOAuthUser {
  codename: string;
  firstname: string;
  lastname?: string;
  email?: string;
  password: string;
}

export interface IValidationByUser {
  validationEmail: string;
  validationId: number;
  isValidated: boolean;
  id: number;
  code: string;
}
