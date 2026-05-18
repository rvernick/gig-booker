import { randomInt } from 'crypto';
import { sendMailgunEmail } from './mailgun-utils';

export const fiveMinutesInSeconds = 5 * 60;
export const tenMinutesInMilliseconds = 1000 * 60 * 10;
export const twoDaysInMilliseconds = 48 * 60 * 60 * 1000;
export const fiveDaysInMilliseconds = 5 * 24 * 60 * 60 * 1000;
export const tenDaysInMilliseconds = 10 * 24 * 60 * 60 * 1000;
export const fortyFiveDaysInMilliseconds = 45 * 24 * 60 * 60 * 1000;
export const halfHourInSeconds = 30 * 60;
export const fiveMB = 5 * 1024 * 1024;
export const kmPerMile = 1.60934;

export const ensureString = (
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  value: string | string[] | null | undefined | number | any,
): string => {
  if (value == null || value === '') {
    return '';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'string') {
    return value;
  }
  return '';
};

export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV !== 'production';
};

export const devLog = (...args: any[]) => {
  if (isDevelopment()) {
    console.log(...args);
  }
};

export const randomIndex = (max: number): number => {
  return Math.floor(Math.random() * (max + 1));
};

export const createSixDigitCode = (): string => {
  const basis = randomInt(1000001, 9999999);
  // console.log('random basis:'+ basis);
  const basisString = basis.toString();
  return basisString.substring(1, 7);
};

export const sendEmail = async (
  email: string[],
  subject: string,
  body: string,
  htmlBody: string = '',
  from: string = 'info@cup-of-sugar.com',
): Promise<boolean> => {
  if (isDevelopment()) {
    console.log(`DEV MODE: Altering emails from ${email.join(', ')} with subject "${subject}" and body "${body}"`);
    const devEmail = process.env.DEV_EMAIL_ADDRESS || 'russ@cup-of-sugar.com';
    const devSubject = `[DEV MODE] ${subject}`;
    return sendMailgunEmail([devEmail], devSubject, body, htmlBody, from);
  }
  return sendMailgunEmail(email, subject, body, htmlBody, from);
};

export const sleep = (seconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000 * seconds);
  });
};
