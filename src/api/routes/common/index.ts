import { Router } from 'express';
import authRoute__loader from './auth';

export default function commonRouteLoader(app: Router) {
  console.log('Loading common routes...');

  authRoute__loader(app);

  console.log('Common routes loaded.');
}
