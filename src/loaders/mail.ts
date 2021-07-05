import AWS from 'aws-sdk';
import { create } from 'express-handlebars';
import ExpressHandlebars from 'express-handlebars/lib/express-handlebars';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import SESTransport from 'nodemailer/lib/ses-transport';
import Container from 'typedi';
import { Logger } from 'winston';
import { env } from '../config';

/**
 * An async loader function that creates a Nodemailer client,
 * tests that it's connected properly, then returns it.
 *
 * @param ses an AWS SES client
 * @returns a nodemailer transporter for injection
 */
export async function nodeMailer__loader(
  ses: AWS.SES
): Promise<nodemailer.Transporter<SESTransport.SentMessageInfo>> {
  console.log('Loading mailer...');
  // Create a nodemailer transporter client
  try {
    // This client will use our SES client to dispatch email requests
    const transporter = nodemailer.createTransport({
      SES: ses,
    });

    transporter.on('error', function (err) {
      const logger: Logger = Container.get('logger');
      logger.error('Error on transporter.');
      logger.error(err);
    });

    // Otherwise, connection was successful and we can inject the mailer
    console.log('Mailer loaded!');

    // Return the mailer for injection
    return transporter;
  } catch (err) {
    console.log('Could not load nodemailer');
    console.log(err);
    throw err;
  }
}

/**
 * Reads in our Handlebars configuration from the environment and creates
 * a configured render engine to be injected into our Container layer.
 *
 * @returns a Handlebars render engine to use in our mailers
 */
export async function handlebars__loader(): Promise<ExpressHandlebars> {
  // Configure and create the render engine
  const hbs = create({
    ...env.HBS_CONFIG,
    ...env.HBS_VIEW_ENGINE_CONFIG,
    handlebars: Handlebars,
  });

  // Return engine for injection
  return hbs;
}
