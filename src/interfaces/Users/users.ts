import { Joi } from 'celebrate';
import { constraints } from '../../config';
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
// TODO test this schema generator
export const UserSchema = (() => {
  function create(type: 'partial' | 'new' | 'whole' = 'new') {
    const partial = type === 'partial';
    const newUser = type === 'new';
    const whole = type === 'whole';

    const maybeRequired = (() => {
      if (partial) return 'optional';
      else return 'required';
    })();

    return Joi.object<IUser | INewUser | Partial<IUser>>({
      // `full` only fields
      ...(whole && {
        id: Joi.number().required(),
        created_at: Joi.date().required(),
        updated_at: Joi.date().required(),
      }),
      ...(newUser && {
        parentEmail: Joi.string().email().optional(),
      }),

      // Common fields
      dob: Joi.date()[maybeRequired](),
      firstname: Joi.string()[maybeRequired](),
      lastname: Joi.string()[maybeRequired](),
      email: Joi.string()[maybeRequired]().email(),
      codename: Joi.string()[maybeRequired]().regex(constraints.codenameRegex),
      password: Joi.string()[maybeRequired]().regex(constraints.passwordRegex),
      roleId: Joi.number()
        [maybeRequired]()
        // Don't let users sign up as an admin from this endpoint
        .disallow(Roles.RoleEnum.admin)
        // If unset, default to signup as a standard user for compatibility
        .default(Roles.RoleEnum.user),

      // Always optional fields
      isValidated: Joi.boolean().optional(),
    }).options({ abortEarly: false });
  }
  function newSchema() {
    return create('new');
  }
  function partialSchema() {
    return create('partial');
  }
  function wholeSchema() {
    return create('whole');
  }
  return { create, new: newSchema, partial: partialSchema, whole: wholeSchema };
})();

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
