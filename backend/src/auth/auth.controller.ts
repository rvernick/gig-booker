/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Query,
  Req,
  Param,
} from '@nestjs/common';
import axios from 'axios';
import { AuthGuard, Public } from './auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from './create-user.dto';
import { GoogleLoginResponse, LoginUserDto } from './login-user.dto';
import { ChangePasswordDto } from './change-password.dto';
import { UpdateUserDto } from './update-user.dto';
import { ResetPasswordDto } from './reset-password.dto';
import express from 'express';
import { ensureString } from '../utils/utils';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('google')
  googleSignIn(@Body() signInDto: GoogleLoginResponse): Promise<{ access_token: string }> {
    console.log('signing in: ', signInDto);
    return this.authService.googleSignIn(signInDto);
  }


  @Public()
  @Post('login')
  signIn(@Body() signInDto: LoginUserDto): Promise<{ access_token: string }> {
    console.log('signing in: ' + signInDto.username);
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Get('user')
  async getUser(@Query('username') username: string): Promise<any> {
    console.log('auth/user user:' + username);
    const result: any = await this.authService.getUser(username);

    return result;
  }

  @Public()
  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    console.log('creating user: ' + createUserDto.username);
    return this.authService.createUser(
      createUserDto.username,
      createUserDto.password,
    );
  }

  @Post('change-password')
  changePassword(@Body() changePassword: ChangePasswordDto) {
    return this.authService.changePassword(
      changePassword.username,
      changePassword.oldPassword,
      changePassword.newPassword,
    );
  }

  @UseGuards(AuthGuard)
  @Post('update-user')
  updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Post('delete-user')
  deleteUser(@Body('username') username: string) {
    console.log('auth/delete-user: ' + username);
    return this.authService.deleteUser(username);
  }

  @UseGuards(AuthGuard)
  @Get('check-session')
  checkSession() {
    return { status: 'logged-in' };
  }

  @Public()
  @Get('healthCheck')
  health() {
    console.log('Health check running.  Returning okay.');
    return 'Running';
  }

  @Public()
  @Post('request-password-reset')
  requestPasswordReset(@Body('username') username: string) {
    return this.authService.requestPasswordReset(username);
  }

  @Post('verify-email')
  requestVerifyEmail(@Body('username') username: string) {
    console.log('auth/request-verify-email: ' + username);
    return this.authService.requestVerifyEmail(username);
  }

  @Post('verify-email-code')
  verifyEmailCode(@Body('code') code: string): Promise<boolean> {
    console.log('auth/verify-email-code: ' + code);
    return this.authService.verifyEmailCode(code);
  }

  @Post('test-email-send')
  testEmailSend(@Body('code') code: string): Promise<boolean> {
    console.log('auth/test-email-send: ' + code);
    return this.authService.testEmailSend(code);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(AuthGuard)
  @Get('places-details-proxy/:placeId')
  async placesDetailsProxy(
    @Req() request: express.Request,
    @Param() params: any,
    @Query('languageCode') languageCode?: string,
  ): Promise<any> {
    const placeId = params.placeId;
    console.log('auth/places-details-proxy placeId:' + placeId);
    console.log('req headers: ', request);
    console.log('req headers: ', request.headers);
    const headers: Record<string, string> = {
      'X-Goog-Api-Key': process.env.GOOGLE_API_KEY || '',
    };

    if (request.header('X-Goog-SessionToken')) {
      console.log('req headers: ', request.header('X-Goog-SessionToken'));
    }

    if (request.header('X-Goog-Api-Key')) {
      headers['X-Goog-Api-Key'] = ensureString(request.header('X-Goog-Api-Key'));
    } else {
      console.log('No X-Goog-Api-Key header found in request.');
    }
    if (request.header('X-Goog-SessionToken')) {
      // eslint-disable-next-line prettier/prettier
      headers['X-Goog-SessionToken'] = ensureString(request.header('X-Goog-SessionToken'));
    } else {
      console.log('No X-Goog-SessionToken header found in request.');
    }

    const fieldMask = request.headers['x-goog-fieldmask'];
    if (fieldMask) {
      headers['X-Goog-FieldMask'] = ensureString(fieldMask);
    } else {
      console.log('No X-Goog-FieldMask header found in request.');
    }

    let url = `https://places.googleapis.com/v1/places/${placeId}`;
    if (languageCode) {
      url += `?languageCode=${encodeURIComponent(languageCode)}`;
    }

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}
