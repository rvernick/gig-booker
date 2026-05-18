/* eslint-disable prettier/prettier */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './auth/user.entity';
import { Household } from './auth/household.entity';
import { EmailVerify } from './auth/email-verify.entity';
import { OAuthVerify } from './auth/oauth-verify.entity';
import { S3Media } from './media/aws-media.entity';
import { GeographicLocation } from './auth/geographic-location.entity';
import { PasswordReset } from './auth/password-reset.entity';
import { CoSEventHandled } from './event-handling/event-handled.entity';
import { CoSEvent } from './event/event.entity';
import { HelpOffer } from './help-request/help-offer';
import { HelpRequest } from './help-request/help-request';

export const AppDataSource = new DataSource({
  type: 'postgres',
  port: 5432,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.DATABASE_HOST === 'localhost',
  logging: false,
  entities: [User, EmailVerify, OAuthVerify, PasswordReset,
    Household, S3Media,
    HelpRequest, HelpOffer,
    GeographicLocation,
    CoSEvent, CoSEventHandled,
  ],
  migrations: ['./migrations/*'],
  subscribers: [],
});
