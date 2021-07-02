import Container from 'typedi';
import { s3__loader, ses__loader } from './aws';
import { logger__loader } from './logger';
import { handlebars__loader, nodeMailer__loader } from './mail';
import { dsDB__loader, mainDB__loader } from './postgres';

/**
 * An async loader function that sequentially runs several loader functions
 * and injects the configured clients into our application's Container layer.
 *
 * Preconfiguring our clients and putting them onto a Container layer allows us to:
 * - access the clients simply and consistently from anywhere in our application
 * - ensure all of our clients are connected by the time the server runs
 * - catch any connection issues before deployment
 */
export default async function dependencyInjector__loader() {
  try {
    // Load logger first always
    const log = logger__loader(); // The loader function returns a client...
    Container.set('logger', log); // We add that client to our container

    // S3 loader is simple with no dependencies...
    const s3 = await s3__loader();
    Container.set('s3', s3);

    // So are our database connections
    const pgMain = await mainDB__loader();
    Container.set('pg', pgMain);
    const pgDS = await dsDB__loader();
    Container.set('ds', pgDS);

    // Load configured Handlerbars render engine
    const hbs = await handlebars__loader();
    Container.set('hbs', hbs);

    // Sequentially load mail service tools as nodemailer can wrap an existing SES connection
    const ses = await ses__loader(); // --> SES client returned (and NOT put on Container)
    const nm = await nodeMailer__loader(ses); // <-- SES client passed into nodemailer loader
    Container.set('mail', nm); // We only need access to nodemailer from our app, as it wraps SES
  } catch (err) {
    console.error(
      'If anything goes wrong during server initialization, unless otherwise documented, \
      the deploy should be considered compromised!',
      "If you're seeing this, you encountered an error on launch!"
    );
    console.log('message:', err.message, 'error:', err);
    throw err;
  }
}
