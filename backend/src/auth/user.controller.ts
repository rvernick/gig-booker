import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard, Public } from './auth.guard';
import { UserService } from './user.service';
import { User } from './user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Media } from '../media/aws-media.entity';
import { fiveMB } from '../utils/utils';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('all')
  getAll(@Query('username') username: string): Promise<User[] | null> {
    console.log('user/all user:' + username);
    // if (username == 'rvernick' || username == 't5@t.com') {
    return this.userService.findAll();
    // }
    // return Promise.resolve([]);
  }

  @Post('upload-user-photo')
  @UseInterceptors(FileInterceptor('file'))
  uploadUserPhoto(@UploadedFile('file') file: Express.Multer.File, @Body('username') username: string) {
    if (file.size > fiveMB) {
      throw new Error('File size exceeds 5MB limit');
    }
    console.log('user/upload-user-photo');
    void this.userService.updateUserPhoto(username, file);
  }

  @Get('photo')
  getPhoto(@Query('id') id: number): Promise<S3Media | null> {
    console.log('get photo:' + id);
    return this.userService.getPhoto(id);
  }

  @Post('flag-photo')
  flagPhoto(@Body('id') id: number, @Body('username') username: string, @Body('reason') reason: string) {
    console.log('flag photo:' + id);
    this.userService.flagPhoto(id, username, reason);
  }

  @Post('update-email')
  @UseGuards(AuthGuard)
  updateEmail(@Body('username') username: string, @Body('email') newEmail: string): Promise<User | null> {
    console.log('user/update-email user:' + username);
    return this.userService.updateEmail(username, newEmail);
  }

  @Post('update-home-address')
  @UseGuards(AuthGuard)
  updateHomeAddress(
    @Body('username') username: string,
    @Body('address') homeAddress: any,
    @Body('entering_instructions') enteringInstructions: string | null,
  ): Promise<User | null> {
    console.log('user/update-email user:' + username);
    return this.userService.updateHomeAddress(username, homeAddress, enteringInstructions);
  }

  @Post('accept-terms')
  @UseGuards(AuthGuard)
  acceptTerms(@Body('username') username: string): Promise<User | null> {
    console.log('user/update-email user:' + username);
    return this.userService.acceptTerms(username);
  }

  @UseGuards(AuthGuard)
  @Get('oauth-verify-code')
  getOAuthVerifyCode(@Query('username') username: string, @Query('target') target: string): Promise<string | null> {
    console.log('user/oauth-verify-code user: ' + username, target);
    return this.userService.createOAuthVerifyCode(username, target);
  }

  @Public()
  @Get('v1/secrets')
  getSecrets(
    @Query('verifyCode') verifyCode: string,
    @Query('target') target: string = 'strava',
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ): Promise<any | null> {
    console.log('user/v1/secrets user: ' + verifyCode, target);
    return this.userService.getSecretsV1(verifyCode, target);
  }

  @UseGuards(AuthGuard)
  @Get('v1/system-secrets')
  getSecretsSecurelyV1(): Promise<any> {
    return this.userService.getSecretsSecurelyV1();
  }

  @Public()
  @Get('google-ios-client-id')
  googleIOSClientId() {
    return this.userService.getGoogleIOSClientId();
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('update-push-token')
  updatePushToken(@Body('username') username: string, @Body('push_token') pushToken: string): Promise<User | null> {
    console.log('user/update-push-token user: ' + username);
    return this.userService.updatePushToken(username, pushToken);
  }
}
