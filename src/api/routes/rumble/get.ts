/** URL Scope: /rumble */

import { Router } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { API, Enum, Sections } from '../../../interfaces';
import { CleverService } from '../../../services';

interface GetRumbleInitResponse {
  enumData: Enum.IEnumData;
  sections: Sections.ISectionWithRumbles[];
}

/**
 * This route is intended to be the application init route for
 * users, if there is any data a user needs immediately on sign
 * in this is where we should be giving it to them.
 */
export default function classroomRumbleRoute__get(route: Router) {
  const logger: Logger = Container.get('logger');
  const cleverServiceInstance = Container.get(CleverService);

  route.get<
    never, // URL parameters
    GetRumbleInitResponse, // Response body
    API.WithAuth, // Request body
    never // Query parameters
  >('/', async (req, res, next) => {
    try {
      const data = await cleverServiceInstance.getUserInfo(req.body.__user);
      res.status(200).json(data);
    } catch (err) {
      logger.error(err);
      next(err);
    }
  });
}
