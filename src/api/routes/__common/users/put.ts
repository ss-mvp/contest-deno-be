/** Current URL Scope: /users */

import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import { DateTime } from 'luxon';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Users } from '../../../../interfaces';
import { UserModel } from '../../../../models';
import { authHandler } from '../../../middlewares';

/**
 * Update a user by id
 */
export default function userRoute__put(route: Router) {
  const logger: Logger = Container.get('logger');
  const userModelInstance = Container.get(UserModel);

  route.put<
    API.WithId, // URL parameters
    Users.IUser, // Response body
    API.WithAuth<Partial<Users.IUser>>, // Request body
    never // Query parameters
  >(
    '/:id',
    authHandler({ matchIdOn: 'id' }),
    celebrate({
      [Segments.BODY]: Users.Schema.partial()
        .options({ allowUnknown: true })
        .keys({
          roleId: Joi.forbidden(),
          isValidated: Joi.forbidden(),
          parentEmail: Joi.forbidden(),
          id: Joi.forbidden(),
          created_at: Joi.forbidden(),
        }),
    }),
    async (req, res, next) => {
      try {
        Reflect.deleteProperty(req.body, '__user');
        const response = await userModelInstance.update(
          req.params.id,
          Object.assign(req.body, {
            updated_at: DateTime.utc().toISO(),
          })
        );
        Reflect.deleteProperty(response, 'password');
        res.status(201).json(response);
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
