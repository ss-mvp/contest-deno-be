import { Transporter } from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/ses-transport';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { env } from '../../config';
import { Users } from '../../interfaces';
import renderEmail from './renderEmail';

@Service()
export default class MailService {
  constructor(
    @Inject('mail') private mailer: Transporter<SentMessageInfo>,
    @Inject('logger') private logger: Logger
  ) {}

  public async sendValidationEmail(email: string, url: string) {
    try {
      this.logger.debug(`Sending activation email to ${email}`);

      // Render the HBS template with our parameters
      const content = await renderEmail('activation', { url });

      // Send with nodemailer
      const { messageId } = await this.mailer.sendMail({
        to: email,
        from: env.SES_SOURCE,
        html: content,
        subject: 'Activate your Story Squad Account!',
      });

      this.logger.debug(`Activation email ${messageId} success`);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async sendParentValidationEmail(
    email: string,
    url: string,
    firstname: string
  ) {
    try {
      this.logger.debug(`Sending parent activation email to ${email}`);

      // Render the HBS template with our parameters
      const content = await renderEmail('parentActivation', {
        url,
        firstname,
      });

      // Send with nodemailer
      const { messageId } = await this.mailer.sendMail({
        to: email,
        from: env.SES_SOURCE,
        html: content,
        subject: `${firstname} needs your help!`,
      });

      this.logger.debug(`Parent activation email ${messageId} success`);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async sendPasswordResetEmail(user: Users.IUser, token: string) {
    const urlParams = new URLSearchParams({ code: token, email: user.email });
    const url = env.REACT_APP_URL + '/reset?' + urlParams.toString();

    try {
      this.logger.debug(`Sending password reset email to ${user.email}`);
      const content = await renderEmail('resetPassword', {
        url,
        username: user.codename,
      });

      // Send with nodemailer
      const { messageId } = await this.mailer.sendMail({
        to: user.email,
        from: env.SES_SOURCE,
        html: content,
        subject: 'Password reset requested!',
      });

      this.logger.debug(`Password reset email ${messageId} success`);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async sendCodenameReminderEmail({
    codename,
    email,
  }: {
    codename: string;
    email: string;
  }) {
    try {
      this.logger.debug('Sending forgot codename email to ' + email);
      const content = await renderEmail('forgotCodename', { codename });

      // Send with nodemailer
      const { messageId } = await this.mailer.sendMail({
        to: email,
        from: env.SES_SOURCE,
        html: content,
        subject: 'Codename reminder requested!',
      });

      this.logger.debug('Forgot codename email success: ' + messageId);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
