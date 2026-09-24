import { IsNotEmpty } from 'class-validator';
import { AccessRole } from '../constants';

/**
 * User credentials for login
 */
export class LoginDto {
  /**
   * Name of the user
   * @example john@example.com
   */
  @IsNotEmpty()
  username: string;
  /**
   * Password of the user
   * @example example_password
   */
  @IsNotEmpty()
  password: string;
}

/**
 * User credentials for updating password
 */
export class UpdatePasswordDto extends LoginDto {
  /**
   * The new password of the user
   * @example example_new_password
   */
  @IsNotEmpty()
  newPassword: string;
}

/**
 * Access token after successful login
 */
export class AccessTokenDto {
  /**
   * The signed and encoded JWT Token
   */
  token: string;
}

export type AccessTokenPayload = {
  /**
   * Login/Username of this token
   */
  sub: string;
  /**
   * Access roles assigned to this token
   */
  roles: AccessRole[];
  /**
   * Timestamp when user was last modified
   */
  modified: number;
};
