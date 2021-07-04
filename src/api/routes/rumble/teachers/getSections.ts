/** URL Scope: /rumble/teachers */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Roles, Sections } from '../../../../interfaces';
import { RumbleService } from '../../../../services';
import { authHandler } from '../../../middlewares';

/**
 * Get a list of sections with rumbles for a given student.
 */
export default function rumbleTeachersRoute__getSections(route: Router) {
  const logger: Logger = Container.get('logger');
  const rumbleServiceInstance = Container.get(RumbleService);

  route.get<
    API.WithId, // URL parameters
    Sections.ISectionWithRumbles[], // Response body
    API.WithAuth, // Request body
    never // Query parameters
  >(
    '/:id/sections',
    authHandler({ roles: [Roles.RoleEnum.user, Roles.RoleEnum.admin] }),
    async (req, res) => {
      try {
        const sections = await rumbleServiceInstance.getSections(
          req.body.__user
        );
        res.status(200).json(sections);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}
