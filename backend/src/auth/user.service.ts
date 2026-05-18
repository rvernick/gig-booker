/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Logger, Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Source, User, createNewUser } from './user.entity';
import { HttpService } from '@nestjs/axios';
import { PasswordReset, createToken } from './password-reset.entity';
import { ConfigService } from '@nestjs/config';
import { createSixDigitCode, devLog, sendEmail, tenMinutesInMilliseconds } from '../utils/utils';
import { EmailVerify } from './email-verify.entity';
import { OAuthVerify } from './oauth-verify.entity';
import { Household } from './household.entity';
import { S3MediaService } from '../media/aws-media.service';
import { S3Media } from '../media/aws-media.entity';
import { GeographicLocation } from './geographic-location.entity';
import { randomInt } from 'crypto';
import { EventService } from '../event/event.service';

export const NO_LOCATION_INFO = 'No location information provided.';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(GeographicLocation)
    private geographicLocationRepository: Repository<GeographicLocation>,
    @InjectRepository(Household)
    private householdRepository: Repository<Household>,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    @InjectRepository(EmailVerify)
    private emailVerifyRepository: Repository<EmailVerify>,
    @InjectRepository(OAuthVerify)
    private oauthVerifyRepository: Repository<OAuthVerify>,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(DataSource)
    private readonly dataSource: DataSource,
    @Inject(HttpService)
    private readonly httpService: HttpService,
    @Inject(EventService)
    private readonly eventService: EventService,
    @Inject(S3MediaService)
    private readonly mediaService: S3MediaService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['homeLocation'],
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
  }

  async findAllDefault(): Promise<User[]> {
    return this.usersRepository.find({
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ id });
  }

  async findAuthorizedUser(username: string): Promise<User> {
    const user = await this.findUsername(username);
    if (!user) throw new UnauthorizedException(`No valid user ${username}`);
    return user;
  }

  async findUsername(username: string): Promise<User | null> {
    if (username == null) return null;
    return this.usersRepository.findOne({
      where: {
        username: username.toLocaleLowerCase(),
      },
    });
  }

  canBypassEmailVerification(username: string): boolean {
    return username.includes('@cup-of-sugar.com');
  }

  async createUser(username: string, password: string, type: Source, familyId: number = 0): Promise<User> {
    devLog('createUser ' + username);
    devLog('type ' + type);
    const newUser = createNewUser(username.toLocaleLowerCase(), password, type);
    devLog('newUser:' + JSON.stringify(newUser));
    if (newUser.source === Source.CUP_OF_SUGAR) {
      newUser.emailVerified = this.canBypassEmailVerification(username);
      newUser.email = username;
    } else {
      this.logger.log('info', 'Source not matched create user with source: ' + type);
    }
    let household: Household | null = null;
    if (familyId > 0) {
      household = await this.getHousehold(familyId);
      if (household != null) {
        newUser.household = household;
      }
    }
    const user = await this.usersRepository.save(newUser);
    return user;
  }

  async getHousehold(id: number): Promise<Household | null> {
    return this.householdRepository.findOneBy({ id: id });
  }

  updatePassword(user: User, newPassword: string) {
    user.password = newPassword;
    this.save(user);
  }

  async updateEmail(username: string, newEmail: string): Promise<User> {
    const user = await this.findAuthorizedUser(username);
    user.email = newEmail;
    user.emailVerified = false;
    devLog('updateEmail user:' + username + ', newEmail:' + newEmail);
    return this.usersRepository.save(user);
  }

  async updateHomeAddress(username: string, locationInfo: any, enteringInstructions: string | null): Promise<User> {
    const user = await this.findAuthorizedUser(username);
    if (locationInfo == null) {
      user.homeLocation = null;
    } else {
      user.homeLocation = await this.updateLocation(locationInfo);
    }
    await this.setEnteringInstructions(user, enteringInstructions);
    return this.save(user);
  }

  async setEnteringInstructions(user: User, instructions: string | null): Promise<void> {
    const household = user.household;
    if (instructions == null) {
      if (!household || !household.enteringInstructions || household.enteringInstructions === '') return;
      household.enteringInstructions = null;
      await this.householdRepository.save(household);
      return;
    }
    const forSureHousehold = await this.ensureHouseholdFor(user);
    forSureHousehold.enteringInstructions = instructions;
    await this.householdRepository.save(forSureHousehold);
  }

  async acceptTerms(username: string): Promise<User> {
    const user = await this.findAuthorizedUser(username);
    user.agreedToTermsAndConditions = true;
    return this.save(user);
  }

  save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async updateUser(
    user: User,
    firstName: string | null,
    lastName: string | null,
    mobile: string | null,
    locationInfo: any,
    enteringInstructions: string | null = null,
  ) {
    if (firstName != null) user.firstName = firstName;
    if (lastName != null) user.lastName = lastName;
    if (mobile != null) user.mobile = mobile;
    if (locationInfo != NO_LOCATION_INFO) {
      user.homeLocation = await this.updateLocation(locationInfo);
    }
    await this.setEnteringInstructions(user, enteringInstructions);
    this.usersRepository
      .save(user)
      .then(() => {
        this.removeOrphanedLocations();
      })
      .catch((error) => {
        this.logger.error('Error updating user: ', error);
      });
  }

  private async removeOrphanedLocations() {
    const randomNumber = randomInt(1, 100);
    if (randomNumber > 5) {
      return; // Return 95 out of 100 times
    }

    try {
      await this.dataSource
        .createQueryBuilder()
        .delete()
        .from(GeographicLocation)
        .where(`id NOT IN (SELECT "home_location_id" FROM cos_user WHERE "home_location_id" IS NOT NULL)`)
        .execute();
    } catch (error) {
      this.logger.error('Error removing orphaned locations: ', error);
    }
  }

  async updateLocation(locationInfo: any): Promise<GeographicLocation | null> {
    if (locationInfo == null) return Promise.resolve(null);
    this.logger.log('info', 'Updating location for user: ' + locationInfo);
    if (locationInfo.id > 0) {
      return await this.geographicLocationRepository.findOneBy({
        id: locationInfo.id,
      });
    }
    const location = this.geographicLocationRepository.create();
    location.displayName = locationInfo.displayName;
    location.formattedAddress = locationInfo.formattedAddress;
    location.placeId = locationInfo.placeId;
    location.types = locationInfo.types;
    location.coordinates = locationInfo.coordinates;
    return this.geographicLocationRepository.save(location);
  }

  async deleteUser(user: User) {
    await this.usersRepository.softDelete(user.id);
  }

  async updatePushToken(username: string, pushToken: string): Promise<User | null> {
    const user = await this.findUsername(username);
    if (user == null) {
      this.logger.error('User not found for username:' + username);
      return null;
    }
    this.logger.log('info', 'Updated push token for user was: ' + user.pushToken);

    user.pushToken = pushToken || '';
    this.logger.log('info', 'Updated push token for user' + user.pushToken);

    return this.usersRepository.save(user);
  }

  async getStravaSSOCode(): Promise<any> {
    const oauthVerify = this.oauthVerifyRepository.create();
    oauthVerify.code = createSixDigitCode();
    oauthVerify.target = 'strava';
    oauthVerify.expiresOn = new Date(Date.now() + tenMinutesInMilliseconds);
    const verify = await this.oauthVerifyRepository.save(oauthVerify);
    const result = { verifyCode: verify.code };
    devLog('Created verify code for Strava: ' + JSON.stringify(result));
    return result;
  }

  async createOAuthVerifyCode(username: string, target: string = 'strava'): Promise<string | null> {
    const user = await this.findUsername(username);
    if (user == null) return null;
    const oauthVerify = this.oauthVerifyRepository.create();
    oauthVerify.code = createSixDigitCode();
    oauthVerify.user = user;
    oauthVerify.target = target;
    oauthVerify.expiresOn = new Date(Date.now() + tenMinutesInMilliseconds);
    this.oauthVerifyRepository.save(oauthVerify);
    return oauthVerify.code;
  }

  async userForValidOAuthVerifyCode(code: string, target: string): Promise<User | null> {
    const verifyCode = await this.getAndVerifyOAuthCode(code, target);
    return verifyCode.user;
  }

  async getUserIdsWithStravaLinked(): Promise<number[]> {
    try {
      const queryBuilder = this.usersRepository.createQueryBuilder('user');
      queryBuilder.select('user.id', 'id');
      queryBuilder.where('user.stravaId IS NOT NULL');
      const result = await queryBuilder.getRawMany();
      return result.map((row) => row.id);
    } catch (e: any) {
      console.log(e.message);
    }
    return Promise.resolve([]);
  }

  async getOAuthByVerifyCode(verifyCode: string, target: string): Promise<OAuthVerify | null> {
    return await this.oauthVerifyRepository.findOne({
      where: {
        code: verifyCode,
        target: target,
      },
    });
  }

  async getSecretsV1(verifyCode: string, target: string): Promise<any> {
    devLog('getSecretsV1: ' + verifyCode + ' ' + target);
    let result = {};
    if (verifyCode == 'ssologinattempt') {
      devLog('SSO login attempt 2 secrets');
      result = {
        stravaClientId: this.safelyGetConfig('STRAVA_CLIENT_ID'),
        stravaSecret: this.safelyGetConfig('STRAVA_CLIENT_SECRET'),
        googleIOSClientID: this.safelyGetConfig('GOOGLE_IOS_CLIENT_ID'),
      };
    }
    // if (verifyCode && verifyCode.length > 0) {
    //   result = await this.getAndVerifyOAuthCode(verifyCode, target, false);
    // }
    result = {
      stravaClientId: this.safelyGetConfig('STRAVA_CLIENT_ID'),
      stravaSecret: this.safelyGetConfig('STRAVA_CLIENT_SECRET'),
      googleIOSClientID: this.safelyGetConfig('GOOGLE_IOS_CLIENT_ID'),
    };
    devLog('getSecretsV1 result: ', JSON.stringify(result));
    return Promise.resolve(result);
  }

  async getSecretsSecurelyV1(): Promise<any> {
    const result = {
      googleMapsAPIKey: this.safelyGetConfig('GOOGLE_MAPS_API_KEY'),
    };
    return Promise.resolve(result);
  }

  async getGoogleIOSClientId(): Promise<string> {
    return Promise.resolve(this.safelyGetConfig('GOOGLE_IOS_CLIENT_ID'));
  }

  async getAndVerifyOAuthCode(verifyCode: string, target: string, requireUser: boolean = true): Promise<OAuthVerify> {
    const verify = await this.getOAuthByVerifyCode(verifyCode, target);

    if (verify == null || verify.expiresOn < new Date()) {
      this.logger.log('info', 'verify not found:' + verifyCode);
      throw new UnauthorizedException();
    }
    if (verify.expiresOn < new Date()) {
      this.logger.log('info', 'expired verify: ' + verifyCode + ' ' + verify.expiresOn.toISOString());
      throw new UnauthorizedException();
    }
    if (requireUser && verify.user == null) {
      this.logger.log('info', 'failed null user check: ' + verifyCode);
      throw new UnauthorizedException();
    }
    return verify;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const passwordReset = await this.passwordResetRepository.findOne({
      where: {
        token: token,
      },
    });
    if (passwordReset != null && passwordReset.expiresOn > new Date()) {
      const user = passwordReset.user;
      devLog('passwordReset', 'Resetting password for:' + JSON.stringify(passwordReset));
      user.setRawPassword(newPassword);
      await this.usersRepository.save(user);
    }
  }

  async testEmailSend(code: string): Promise<boolean> {
    if (code !== 'TEST_EMAIL_CODE') return false;
    const email = 'rvernick@yahoo.com';
    const msg = 'Your email verification code is: ' + code + '.';
    const htmlMsg = 'Your email verification code is: ' + code + '.  ';
    if (await sendEmail([email], 'Cup of Sugar Password Reset', msg, htmlMsg)) {
      devLog('Test email sent successfully');
      return true;
    } else {
      devLog('Test email failed to send ');
      return false;
    }

    return true;
  }

  async verifyEmailCode(code: string): Promise<boolean> {
    const emailVerify = await this.emailVerifyRepository.findOne({
      where: {
        code: code,
      },
    });
    if (emailVerify != null && emailVerify.expiresOn > new Date()) {
      const user = emailVerify.user;
      user.emailVerified = true;
      await this.usersRepository.save(user);
      return true;
    }
    throw new Error('Invalid code');
  }

  initiatePasswordReset(user: User, email: string): void {
    const passwordReset = this.createPasswordReset(user);
    const passwordResetLink = this.createPasswordResetLink(passwordReset);
    this.logger.log('reset link: ' + passwordResetLink);
    this.sendPasswordResetEmail(email, passwordResetLink);
  }

  createPasswordReset(user: User): PasswordReset {
    const token = createToken(user);
    const now = new Date();
    const tenMinutesInMilliseconds = 10 * 60 * 1000;
    const expirationDate = new Date(now.getTime() + tenMinutesInMilliseconds);
    const passwordReset = new PasswordReset(user, token, expirationDate);
    this.passwordResetRepository.save(passwordReset);
    return passwordReset;
  }

  getClientBaseUrl(): string {
    return this.safelyGetConfig('CLIENT_URL');
  }

  createPasswordResetLink(passwordReset: PasswordReset): string {
    const baseUrl = this.getClientBaseUrl();
    return baseUrl + '/new-password-on-reset?token=' + passwordReset.token;
  }

  sendPasswordResetEmail(email: string, passwordResetLink: string): void {
    // devLog('info', email + ' sending with:' + process.env.SENDGRID_API_KEY);
    const msg = 'Use the following link to reset your password: ' + passwordResetLink;
    const htmlMsg =
      'Use the following link to reset your password: <a href="' + passwordResetLink + '"> Reset Password</a>';

    void sendEmail([email], 'Cup of Sugar Password Reset', msg, htmlMsg);
  }

  async initiateEmailVerify(user: User, email: string): Promise<void> {
    const emailVerify = await this.createEmailVerify(user);
    this.sendEmailVerifyEmail(email, emailVerify.code);
  }

  async createEmailVerify(user: User): Promise<EmailVerify> {
    const code = createSixDigitCode();
    const now = new Date();
    const tenMinutesInMilliseconds = 10 * 60 * 1000;
    const expirationDate = new Date(now.getTime() + tenMinutesInMilliseconds);
    const emailVerify = new EmailVerify(user, code, expirationDate);
    this.logger.log('emailVerify', 'Creating email verify for: ' + user.username + ' ' + emailVerify.code);
    devLog('emailVerify  Creating email verify for:' + JSON.stringify(emailVerify));
    return await this.emailVerifyRepository.save(emailVerify);
  }

  sendEmailVerifyEmail(email: string, code: string): void {
    // devLog('info', email + ' sending with:' + process.env.SENDGRID_API_KEY);
    const msg = 'Your email verification code is: ' + code + '.';
    const htmlMsg = 'Your email verification code is: ' + code + '.  ';

    sendEmail([email], 'Cup of Sugar Verify Email', msg, htmlMsg);
  }

  safelyGetConfig(key: string): string {
    const value = this.configService.get(key);
    if (value == null) {
      throw new Error('Missing configuration:' + key);
    }

    return value;
  }

  async ensureHouseholdFor(user: User): Promise<Household> {
    if (user.household == null) {
      user.household = await this.householdRepository.save(this.householdRepository.create());
    }
    await this.usersRepository.save(user);
    return user.household;
  }

  async updateUserPhoto(username: string, file: Express.Multer.File): Promise<string> {
    try {
      const user = await this.findAuthorizedUser(username);
      const oldPhoto = user.photo;
      user.photo = await this.mediaService.createPhoto(file, user.id);
      await this.usersRepository.save(user);
      if (oldPhoto != null) {
        await this.mediaService.refreshPhoto(oldPhoto);
      }
      return '';
    } catch (error) {
      console.error('Error updating user photo: ', error);
      return '';
    }
  }

  async getPhoto(id: number): Promise<S3Media | null> {
    return this.mediaService.getPhoto(id);
  }

  flagPhoto(id: number, username: string, reason: string): void {
    void sendEmail(
      ['systems@cup-of-sugar.com'],
      `Photo Flagged: ${id}`,
      `Photo ${id} has been flagged as inappropriate by user ${username}.  Claimed: ${reason}.  Please review and remove if necessary.`,
      '',
      'systems@cup-of-sugar.com',
    );
  }

  /**
   * Calculate distance between two geographic locations
   * @param location1 - First geographic location
   * @param location2 - Second geographic location
   * @returns Distance in miles
   */
  async calculateDistance(location1: GeographicLocation, location2: GeographicLocation): Promise<number> {
    if (!location1.coordinates || !location2.coordinates) {
      throw new Error('Both locations must have coordinates');
    }

    try {
      const query = `
        SELECT ST_Distance(
          $1::geography,
          $2::geography
        ) as distance
      `;

      const result = await this.geographicLocationRepository.query(query, [
        location1.coordinates,
        location2.coordinates,
      ]);

      // Distance is returned in meters, convert to miles
      const distanceMeters = result[0].distance;
      const distanceKm = distanceMeters / 1000;

      return distanceKm / 1.60934;
    } catch (error) {
      this.logger.error('Error calculating distance:', error);
      throw new Error('Failed to calculate distance');
    }
  }
}
