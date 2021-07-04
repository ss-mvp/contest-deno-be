/** URL Scope: /users */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles } from '../../../../interfaces';
import { UserModel } from '../../../../models';
import { parseGetQuery } from '../../../../utils/parsers';
import { authHandler } from '../../../middlewares';

/**
 * This route should be used to check the availability of usernames or
 * email address in our database, as well as pre-check GET request sizes.
 */
export default function userRoute__head(route: Router) {
  const logger: Logger = Container.get('logger');
  const userModelInstance = Container.get(UserModel);

  route.head<
    never, // URL parameters
    never, // Response body
    never, // Request body
    API.GetParams // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.admin, Roles.RoleEnum.teacher] }),
    async (req, res, next) => {
      try {
        const queryOpts = parseGetQuery(req.query);
        const userList = await userModelInstance.get(undefined, queryOpts);

        // check how many results we found
        let numResults: number;
        if (Array.isArray(userList)) numResults = userList.length;
        else numResults = !!userList ? 1 : 0;

        // Return that in the content-length
        res.set('Content-Length', `${numResults}`);
        // Let them know what type of data to expect
        res.set('Content-Type', 'application/json; charset=utf-8');
        // End the request
        res.status(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
