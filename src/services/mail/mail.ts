import ExpressHandlebars from 'express-handlebars/lib/express-handlebars';
import { Transporter } from 'nodemailer';
import SESTransport from 'nodemailer/lib/ses-transport';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { env } from '../../config';
import { Users } from '../../interfaces';

@Service()
export default class MailService {
  constructor(
    @Inject('mail') private mailer: Transporter<SESTransport.SentMessageInfo>,
    @Inject('logger') private logger: Logger,
    @Inject('hbs') private hbs: ExpressHandlebars
  ) {}

  public async sendValidationEmail(email: string, url: string) {
    try {
      this.logger.debug(`Sending activation email to ${email}`);

      // Render the HBS template with our parameters
      const content = await this.__render('activation', { url });

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
      const content = await this.__render('parentActivation', {
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
      const content = await this.__render('resetPassword', {
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

  /**
   * This function is a wrapper around the Handlebars render function that
   * wraps it in a Promise so we can use more modern and convenient syntax.
   *
   * @param viewPath the name of the email template you wish to render
   * @param options an object map that inserts your template variables
   * @returns the rendered email content on success
   */
  private async __render(
    viewPath: string,
    options: Record<string, unknown>
  ): Promise<string> {
    // Promis-ify our handlebars render function and await the results
    const content = await new Promise<string | undefined>((resolve, reject) => {
      // Using the Promise constructor, we can Promisify this old-school callback function
      this.hbs.renderView(viewPath, options, (err, content) => {
        // Promise rejects if an error occurs
        if (err) reject(err);
        // Otherwise it resolves to our email content
        else resolve(content);
      });
    });

    if (!content) {
      this.logger.crit('Could not render email template:', viewPath, options);
      throw new Error('Could not render email template');
    }

    // Return the email content
    return content;
  }
}
