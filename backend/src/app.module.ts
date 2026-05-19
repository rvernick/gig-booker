/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/user.entity';
import { Household } from './auth/household.entity';
import { GeographicLocation } from './auth/geographic-location.entity';
import { OAuthVerify } from './auth/oauth-verify.entity';
import { EmailVerify } from './auth/email-verify.entity';
import { S3Media } from './media/aws-media.entity';
import { CoSEventHandled } from './event-handling/event-handled.entity';
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
import { CoSEvent } from './event/event.entity';
import { EventHandlingService } from './event-handling/event-handling.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HelpRequest } from './help-request/help-request';
import { HelpOffer } from './help-request/help-offer';
import { HelpService } from './help-request/help.service';
import { HelpController } from './help-request/help.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Household,
      User,
      PasswordReset,
      HelpRequest,
      HelpOffer,
      EmailVerify,
      OAuthVerify,
      PasswordReset,
      S3Media,
      GeographicLocation,
      CoSEvent,
      CoSEventHandled,
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
          CoSEvent,
          CoSEventHandled,
        ],
        synchronize: configService.get('DATABASE_HOST') === 'localhost',
      }),
    }),
  ],
  exports: [AuthService, UserService, EventService, EventHandlingService, HelpService],
  controllers: [AppController, AuthController, UserController, HelpController],
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
  ],
})
export class AppModule {}
