import Container from 'typedi';
import { s3__loader, ses__loader } from './aws';
import { logger__loader } from './logger';
import { nodeMailer__loader } from './mail';
import { dsDB__loader, mainDB__loader } from './postgres';

export default async function dependencyInjector__loader() {
  try {
    // Load logger first always
    const log = logger__loader();
    Container.set('logger', log);

    // AWS clients should be loaded early, they have no other deps
    const ses = await ses__loader();
    Container.set('ses', ses);
    const s3 = await s3__loader();
    Container.set('s3', s3);

    // Load NodeMailer
    const nm = await nodeMailer__loader();
    Container.set('mail', nm);

    // Initialize and test our database connections
    const pgMain = await mainDB__loader();
    Container.set('pg', pgMain);
    const pgDS = await dsDB__loader();
    Container.set('ds', pgDS);
  } catch (err) {
    console.log({ err });
    throw err;
  }
}
