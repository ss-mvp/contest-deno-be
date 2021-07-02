import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import SESTransport from 'nodemailer/lib/ses-transport';
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
  // This client will use our SES client to dispatch email requests
  const transporter = nodemailer.createTransport({
    SES: ses,
  });

  try {
    // Add handlebars to the transporter so that we can use our templates
    transporter.use('compile', hbs(env.HBS_CONFIG));

    // Verify that the transporter was initialized properly
    const success = await transporter.verify();

    // If the verification failed, throw an error
    if (!success) throw new Error('Could not verify transporter');

    // Otherwise, connection was successful and we can inject the mailer
    console.log('Mailer loaded!');
  } catch (err) {
    console.log('Could not load nodemailer');
    console.log(err);
  }

  // Return the mailer for injection
  return transporter;
}
