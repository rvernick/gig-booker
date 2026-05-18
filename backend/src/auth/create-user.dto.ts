/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email' })
  username: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password must have at least one upper case letter, one lower case letter and one special character',
  })
  password: string;
}

/**
 * regex to ensure
 * at least one upper case letter
 * at least one lower case letter
 * at least one special character
 * /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
 */
