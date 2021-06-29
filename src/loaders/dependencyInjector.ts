import Container from 'typedi';
import aws from './aws';
import clever from './clever';
import logger from './logger';
import postgres from './postgres';

export default async function dependencyInjector() {
  try {
    const log = logger();
    Container.set('logger', log);

    const pgMain = await postgres.main();
    Container.set('pg', pgMain);

    const pgDS = await postgres.ds();
    Container.set('ds', pgDS);

    const mail = aws.ses();
    Container.set('mail', mail);

    const s3 = aws.s3();
    Container.set('s3', s3);

    const cleverClient = clever();
    Container.set('clever', cleverClient);
  } catch (err) {
    console.log({ err });
    throw err;
  }
}
