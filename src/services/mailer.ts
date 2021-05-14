import {
  Handlebars,
  Inject,
  log,
  SendEmailCommand,
  Service,
  serviceCollection,
  SES,
} from '../../deps.ts';
import hbsConfig from '../../hbsConfig.ts';
import env from '../config/env.ts';
import { IUser } from '../interfaces/users.ts';

const EMAIL_FROM_NAME = 'StorySquad';

@Service()
export default class MailService {
  constructor(
    @Inject('mail') private mailer: SES,
    @Inject('logger') private logger: log.Logger
  ) {}

  public async sendValidationEmail(email: string, url: string) {
    try {
      this.logger.debug(`Sending activation email for user (EMAIL: ${email})`);
      const handle = new Handlebars(hbsConfig());
      const result = await handle.renderView('activation', { url });
      const emailContent = new SendEmailCommand({
        Destination: {
          ToAddresses: [email],
        },
        FromEmailAddress: env.SES_CONFIG.email,
        Content: {
          Simple: {
            Body: {
              Html: {
                Data: result,
              },
            },
            Subject: {
              Data: 'Activate your Story Squad Account!',
            },
          },
        },
      });
      await this.mailer.send(emailContent);
      this.logger.debug(
        `Activation email successfully sent for user (EMAIL: ${email})`
      );
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
      this.logger.debug(
        `Sending parent activation email for child user (EMAIL: ${email})`
      );
      const handle = new Handlebars(hbsConfig());
      const result = await handle.renderView('parentActivation', {
        url,
        firstname,
      });
      const emailContent = new SendEmailCommand({
        Destination: {
          ToAddresses: [email],
        },
        FromEmailAddress: env.SES_CONFIG.email,
        Content: {
          Simple: {
            Body: {
              Html: {
                Data: result,
              },
            },
            Subject: {
              Data: `${firstname} needs their Story Squad account verified`,
            },
          },
        },
      });
      await this.mailer.send(emailContent);
      this.logger.debug(
        `Activation email successfully sent to parent for child user (EMAIL: ${email})`
      );
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async sendPasswordResetEmail(user: IUser, token: string) {
    const urlParams = new URLSearchParams({ code: token, email: user.email });
    const url = env.REACT_APP_URL + '/reset?' + urlParams.toString();

    try {
      this.logger.debug(
        `Sending password reset email for user (EMAIL: ${user.email})`
      );
      const handle = new Handlebars(hbsConfig());
      const result = await handle.renderView('resetPassword', {
        url,
        username: user.codename,
      });
      const emailContent = new SendEmailCommand({
        Destination: {
          ToAddresses: [user.email],
        },
        FromEmailAddress: env.SES_CONFIG.email,
        Content: {
          Simple: {
            Body: {
              Html: {
                Data: result,
              },
            },
            Subject: {
              Data: 'Reset your Story Squad account password!',
            },
          },
        },
      });
      await this.mailer.send(emailContent);
      this.logger.debug(
        `Reset email successfully sent to user (EMAIL: ${user.email})`
      );
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}

serviceCollection.addTransient(MailService);
