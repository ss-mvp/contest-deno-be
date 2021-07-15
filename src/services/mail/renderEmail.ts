import { env } from '@config';
import ExpressHandlebars from 'express-handlebars/lib/express-handlebars';
import { join } from 'path';
import Container from 'typedi';

/**
 * This function is a wrapper around the Handlebars render function that
 * wraps it in a Promise so we can use more modern and convenient syntax.
 *
 * @param viewPath the name of the email template you wish to render
 * @param options an object map that inserts your template variables
 * @returns the rendered email content on success
 */
export default async function renderEmail(
  templateName: string,
  options: Record<string, unknown>
): Promise<string> {
  const hbs: ExpressHandlebars = Container.get('hbs');

  // Promis-ify our handlebars render function and await the results
  const content = await new Promise<string | undefined>((resolve, reject) => {
    // Using the Promise constructor, we can Promisify this old-school callback function
    const templatePath =
      join(env.HBS_CONFIG.viewPath + '/' + templateName) +
      env.HBS_CONFIG.extName;

    hbs.renderView(templatePath, options, (err, content) => {
      // Promise rejects if an error occurs
      if (err) reject(err);
      // Otherwise it resolves to our email content
      else resolve(content);
    });
  });

  if (!content) {
    console.warn('Could not render email template:', templateName, options);
    throw new Error('Could not render email template');
  }

  // Return the email content
  return content;
}
