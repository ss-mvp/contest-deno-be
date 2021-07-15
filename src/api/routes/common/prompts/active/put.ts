/** Current URL Scope: /prompts/active */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { Roles } from '../../../../../interfaces';
import { AdminService } from '../../../../../services';
import { authHandler } from '../../../../middlewares';

/**
 * This route triggers the event that increments the currently active
 * prompt in the database to the next day. It's admin-only, takes no
 * input, and sends no output (aside from errors).
 */
export default function activePromptRoute__put(route: Router) {
  const logger: Logger = Container.get('logger');
  const adminServiceInstance = Container.get(AdminService);

  route.put<
    never, // URL parameters
    never, // Response body
    never, // Request body
    never // Query parameters
  >(
    '/',
    authHandler({ roles: [Roles.RoleEnum.admin] }),
    async (req, res, next) => {
      try {
        await adminServiceInstance.updateActivePrompt();

        res.status(204).end();
      } catch (err) {
        logger.error(err);
        next(err);
      }
    }
  );
}
