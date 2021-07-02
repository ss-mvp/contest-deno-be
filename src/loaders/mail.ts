import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import Container from 'typedi';
import { Logger } from 'winston';
import { env } from '../config';

export async function nodeMailer__loader() {
  console.log('Loading mailer...');
  const ses: AWS.SES = Container.get('ses');
  try {
    const transporter = nodemailer.createTransport({
      SES: ses,
    });
    transporter.use('compile', hbs(env.HBS_CONFIG));
    const success = await transporter.verify();
    if (!success) throw new Error('Could not verify transporter');
    else {
      console.log('Mailer loaded!');
      return transporter;
    }
  } catch (err) {
    const logger: Logger = Container.get('logger');
    logger.error('Could not load nodemailer');
    logger.error(err);
  }
}
