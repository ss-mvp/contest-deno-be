import Container from 'typedi';
import { s3__loader, ses__loader } from './aws';
import logger__loader from './logger';
import { dsDB__loader, mainDB__loader } from './postgres';

export default async function dependencyInjector__loader() {
  try {
    const log = logger__loader();
    Container.set('logger', log);

    const pgMain = await mainDB__loader();
    Container.set('pg', pgMain);

    const pgDS = await dsDB__loader();
    Container.set('ds', pgDS);

    const mail = ses__loader();
    Container.set('mail', mail);

    const s3 = s3__loader();
    Container.set('s3', s3);
  } catch (err) {
    console.log({ err });
    throw err;
  }
}
