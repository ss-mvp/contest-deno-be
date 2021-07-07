import { Joi } from 'celebrate';
import { INewUser, IUser } from '.';
import { constraints } from '../../config';
import { Roles } from '../Enum';

export default (() => {
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
        parentEmail: Joi.string()
          .optional()
          .allow(null, '', undefined, false)
          .empty(''),
      }),

      // Common fields
      dob: Joi.date()[maybeRequired](),
      firstname: Joi.string()[maybeRequired](),
      lastname: Joi.string()[maybeRequired](),
      email: Joi.string()[maybeRequired]().email(),
      codename: Joi.string()[maybeRequired]().regex(constraints.codenameRegex),
      password: Joi.string()[maybeRequired]().regex(constraints.passwordRegex),
      roleId: Joi.number()
        .optional()
        // Don't let users sign up as an admin from this endpoint
        .disallow(Roles.RoleEnum.admin)
        // If unset, default to signup as a standard user for compatibility
        .default(Roles.RoleEnum.user),

      // Always optional fields
      isValidated: Joi.boolean().optional(),
    }).options({ abortEarly: false });
    // TODO explore options for custom, relational validation
    // ?.[(newUser && 'someCustomOptionsForCheckingAgeVSEmailIdk')]
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
