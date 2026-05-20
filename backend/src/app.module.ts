/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/user.entity';
import { Household } from './auth/household.entity';
import { GeographicLocation } from './common/geographic-location.entity';
import { OAuthVerify } from './auth/oauth-verify.entity';
import { EmailVerify } from './auth/email-verify.entity';
import { S3Media } from './media/aws-media.entity';
import { GBEventHandled } from './event-handling/event-handled.entity';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { AuthController } from './auth/auth.controller';
import { UserController } from './auth/user.controller';
import { AuthService } from './auth/auth.service';
import { UserService } from './auth/user.service';
import { EventService } from './event/event.service';
// import { APP_GUARD } from '@nestjs/core';
// import { AuthGuard } from './auth/auth.guard';
import { S3MediaService } from './media/aws-media.service';
import { PasswordReset } from './auth/password-reset.entity';
import { GBEvent } from './event/event.entity';
import { EventHandlingService } from './event-handling/event-handling.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HelpRequest } from './help-request/help-request';
import { HelpOffer } from './help-request/help-offer';
import { HelpService } from './help-request/help.service';
import { HelpController } from './help-request/help.controller';
import { ElevenService } from './eleven-labs/eleven.service';
import { ElevenController } from './eleven-labs/eleven.controller';
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
import { BandController } from './band/band.controller';
import { BandService } from './band/band.service';
import { VenueController } from './venue/venue.controller';
import { VenueService } from './venue/venue.service';
import { Gig } from './gig/gig.entity';
import { GigController } from './gig/gig.controller';
import { GigService } from './gig/gig.service';
import { RecurringGig } from './gig/recurring-gig.entity';
import { RecurringGigController } from './gig/recurring-gig.controller';
import { RecurringGigService } from './gig/recurring-gig.service';
import { UserFavoriteVenue } from './venue/user-favorite-venue.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
      UserFavoriteVenue,
    ]),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `config/env/${process.env.NODE_ENV}.env`,
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.jwtSecret,
      signOptions: { expiresIn: '48h' },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: +configService.get('DATABASE_PORT', 5432),
        database: configService.get('DATABASE_NAME', 'gigbooker'),
        username: configService.get('DATABASE_USER', 'test'),
        password: configService.get('DATABASE_PASSWORD'),
        entities: [
          User,
          Household,
          HelpRequest,
          HelpOffer,
          GeographicLocation,
          PasswordReset,
          OAuthVerify,
          EmailVerify,
          S3Media,
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
          UserFavoriteVenue,
        ],
        synchronize: configService.get('DATABASE_HOST') === 'localhost',
      }),
    }),
  ],
  exports: [AuthService, UserService, EventService, EventHandlingService, HelpService, ElevenService],
  controllers: [
    AppController,
    AuthController,
    UserController,
    HelpController,
    ElevenController,
    BandController,
    VenueController,
    GigController,
    RecurringGigController,
  ],
  providers: [
    AppService,
    // RunService, {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
    AuthService,
    UserService,
    HelpService,
    S3MediaService,
    EventService,
    EventHandlingService,
    ElevenService,
    BandService,
    VenueService,
    GigService,
    RecurringGigService,
  ],
})
export class AppModule {}
