import { Router } from 'express';
import authRoute__loader from './auth';
import promptRoute__loader from './prompts';
import submissionRoute__loader from './submissions';

export default function commonRoutes__loader(app: Router) {
  console.log('Loading common routes...');

  authRoute__loader(app);
  promptRoute__loader(app);
  submissionRoute__loader(app);

  console.log('Common routes loaded.');
}
