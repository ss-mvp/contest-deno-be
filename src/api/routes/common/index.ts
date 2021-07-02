import { Router } from 'express';
import authRoute__loader from './auth';
import promptRoute__loader from './prompts';

export default function commonRouteLoader(app: Router) {
  console.log('Loading common routes...');

  authRoute__loader(app);
  promptRoute__loader(app);

  console.log('Common routes loaded.');
}
