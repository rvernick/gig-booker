/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
import Mailgun from 'mailgun.js';

export const sendMailgunEmail = async (
  email: string[],
  subject: string,
  body: string,
  htmlBody: string | null,
  from: string = 'info@gig-booker.com',
): Promise<boolean> => {
  const apiKey = process.env.MAILGUN_API_KEY;
  if (!apiKey) {
    console.error('Missing MAILGUN_API_KEY environment variable');
    return Promise.resolve(false);
  }
  const mailgun = new Mailgun(FormData);

  const mg = mailgun.client({ username: 'api', key: apiKey });
  try {
    const messageData = htmlBody
      ? {
          from: 'Gig Booker Support<systems@gig-booker.com>',
          to: email,
          subject: subject,
          text: body,
          html: htmlBody,
        }
      : {
          from: 'Gig Booker Support<systems@gig-booker.com>',
          to: email,
          subject: subject,
          text: body,
        };

    const url = 'gig-booker.com';
    // const url = isDevelopment()
    //   ? 'sandboxa7e956f9e5b94612b3300c9b4b25c72c.mailgun.org'
    //   : 'api.mailgun.net/v3/gig-booker.com/messages';
    const sendResult = await mg.messages.create(url, messageData);

    console.log(sendResult); // logs response data
    return sendResult.status == 200;
  } catch (error) {
    console.log(error); //logs any error
  }
  return Promise.resolve(false);
};
