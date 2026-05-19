/* eslint-disable prettier/prettier */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './auth/user.entity';
import { Household } from './auth/household.entity';
import { EmailVerify } from './auth/email-verify.entity';
import { OAuthVerify } from './auth/oauth-verify.entity';
import { S3Media } from './media/aws-media.entity';
import { GeographicLocation } from './common/geographic-location.entity';
import { PasswordReset } from './auth/password-reset.entity';
import { GBEventHandled } from './event-handling/event-handled.entity';
import { GBEvent } from './event/event.entity';
import { HelpOffer } from './help-request/help-offer';
import { HelpRequest } from './help-request/help-request';
import { Band } from './band/band.entity';
import { BandMember } from './band/band-member.entity';
import { BandSocialLink } from './band/band-social-link.entity';
import { SocialLink } from './social/social-link.entity';
import { Venue } from './venue/venue.entity';
import { VenueSocialLink } from './venue/venue-social-link.entity';
import { VenueBookingInstructions } from './venue/venue-booking-instructions.entity';
import { VenueBookingByPhone } from './venue/venue-booking-by-phone.entity';
import { VenueBookingByEmail } from './venue/venue-booking-by-email.entity';
import { VenueBookingByWebForm } from './venue/venue-booking-by-web-form.entity';
import { VenueBookingBySnailMail } from './venue/venue-booking-by-snail-mail.entity';
import { Gig } from './gig/gig.entity';
import { RecurringGig } from './gig/recurring-gig.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  port: 5432,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.DATABASE_HOST === 'localhost',
  logging: false,
  entities: [
    User,
    EmailVerify,
    OAuthVerify,
    PasswordReset,
    Household,
    S3Media,
    HelpRequest,
    HelpOffer,
    GeographicLocation,
    GBEvent,
    GBEventHandled,
    SocialLink,
    Band,
    BandMember,
    BandSocialLink,
    Venue,
    VenueSocialLink,
    VenueBookingInstructions,
    VenueBookingByPhone,
    VenueBookingByEmail,
    VenueBookingByWebForm,
    VenueBookingBySnailMail,
    Gig,
    RecurringGig,
  ],
  migrations: ['./migrations/*'],
  subscribers: [],
});
