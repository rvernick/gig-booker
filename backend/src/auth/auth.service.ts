import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { Source, User } from './user.entity';
import { UpdateUserDto } from './update-user.dto';
import { ResetPasswordDto } from './reset-password.dto';
import { devLog, ensureString } from '../utils/utils';
import { GoogleLoginResponse } from './login-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // need a test for when the username is nill or shouldn't be found
  async signIn(username: string, pass: string): Promise<{ access_token: string; user: User }> {
    const user = await this.userService.findAuthorizedUser(username);

    if (user == null || !user.comparePassword(pass)) {
      this.logger.log('info', 'sign in failed for: ' + username);
      throw new UnauthorizedException();
    }
    return this.createSignInResponse(user);
  }

  async googleSignIn(googleSignInResponse: GoogleLoginResponse): Promise<{ access_token: string; user: User }> {
    if (googleSignInResponse.email == null || googleSignInResponse.email.trim().length === 0) {
      this.logger.log('info', 'Invalid response: ', googleSignInResponse);
      throw new UnauthorizedException(
        `Invalid google sign in response: ${googleSignInResponse.type} for: ${googleSignInResponse.email}`,
      );
    }
    let user = await this.userService.findUsername(googleSignInResponse.email);
    if (user == null) {
      this.logger.log('info', 'creating new user for: ', googleSignInResponse.email);
      const createdUser = await this.userService.createUser(googleSignInResponse.email, '', Source.GOOGLE);
      createdUser.googleIdToken = googleSignInResponse.id_token;
      createdUser.googleId = googleSignInResponse.id;
      createdUser.firstName = googleSignInResponse.given_name;
      createdUser.lastName = googleSignInResponse.family_name;
      createdUser.googlePhotoUrl = ensureString(googleSignInResponse.photo);
      user = await this.userService.save(createdUser);
    } else {
      this.logger.log('info', 'Google login for: ', user.username);
    }
    return this.createSignInResponse(user);
  }

  private async createSignInResponse(user: User): Promise<{ access_token: string; user: User }> {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: user,
    };
  }

  async getUser(username: string): Promise<User | null> {
    return await this.userService.findUsername(username);
  }

  async createUser(username: string, pass: string) {
    const user = await this.userService.findUsername(username);
    if (user != null) {
      this.logger.log('info', 'attempted to create duplicate: ' + username);
      throw new UnauthorizedException();
    }
    return this.userService.createUser(username, pass, Source.CUP_OF_SUGAR);
  }

  async changePassword(username: string, oldPassword: string, newPassword: string): Promise<string> {
    const user = await this.userService.findUsername(username);
    if (user == null || !user.comparePassword(oldPassword)) {
      this.logger.log('info', 'failed change password attempt: ' + username);
      return 'Invalid Password';
    }
    this.logger.log('info', 'password changed for: ' + username);
    this.userService.updatePassword(user, newPassword);
    return '';
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    const username = updateUserDto.username;
    const user = await this.userService.findAuthorizedUser(username);
    devLog('info', 'user updated for: ', updateUserDto);
    void this.userService.updateUser(
      user,
      updateUserDto.firstName,
      updateUserDto.lastName,
      updateUserDto.mobile,
      updateUserDto.homeLocation,
      updateUserDto.entering_instructions,
    );
  }

  async deleteUser(username: string) {
    const user = await this.userService.findAuthorizedUser(username);
    this.userService.deleteUser(user);
  }

  async requestPasswordReset(email: string) {
    const user = await this.userService.findAuthorizedUser(email.toLocaleLowerCase());
    this.userService.initiatePasswordReset(user, email);
  }

  async requestVerifyEmail(email: string) {
    const user = await this.userService.findUsername(email.toLocaleLowerCase());
    if (user == null) {
      this.logger.log('info', 'failed email verify request' + email + ' ' + user);
      return;
    }
    if (user.emailVerified) {
      this.logger.log('info', 'email already verified: ' + email);
      return;
    }
    void this.userService.initiateEmailVerify(user, email);
  }

  async verifyEmailCode(code: string): Promise<boolean> {
    return this.userService.verifyEmailCode(code);
  }

  async testEmailSend(code: string): Promise<boolean> {
    return this.userService.testEmailSend(code);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    await this.userService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }
}
