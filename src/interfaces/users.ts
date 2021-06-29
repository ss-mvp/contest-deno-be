import { DatabaseResult } from '../../deps';
import { Roles } from './roles';

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

export interface INewUser extends IOAuthUser {
  email?: string;
  roleId: Roles & number;
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

export interface IValidationByUser extends DatabaseResult {
  validationEmail: string;
  validationId: number;
  isValidated: boolean;
  id: number;
  code: string;
}
