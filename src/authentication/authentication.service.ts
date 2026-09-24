import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto, AccessTokenPayload } from './dto/login.dto';
import { CryptoService } from './crypto/crypto.service';
import { IUserData, UserRepository } from '../datastore/user-repository/user.repository';
import { SettingsRepository } from '../datastore/settings-repository/settings.repository';
import { ADMIN_USER_NAME } from './constants';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    private userRepository: UserRepository,
    private settingsRepository: SettingsRepository<'authentication'>,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
  ) {}

  /**
   * Get an access token for an user by providing login and password
   */
  async login(login: string, password: string): Promise<AccessTokenDto> {
    const { roles, modified } = await this.getAuthenticatedUserOrThrow(login, password);

    const payload: AccessTokenPayload = { sub: login, roles, modified };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
    };
  }

  /**
   * Update password for an user by providing login, password and the new password
   */
  async updatePassword(userLogin: string, currentPassword: string, newPassword: string): Promise<void> {
    await this.getAuthenticatedUserOrThrow(userLogin, currentPassword);

    await this.updateUserPassword(userLogin, newPassword);

    this.logger.log(`User "${userLogin}" password updated`);
  }

  /**
   * Reset password for admin user to the device specific default password
   */
  async resetAdminPassword(): Promise<void> {
    // TODO: Move admin handling to own service?
    // TODO: refactor password handling to user.service

    const settings = await this.settingsRepository.for('authentication').get();
    settings.isAdminPasswordResetEnabled;

    if (settings.isAdminPasswordResetEnabled === false) {
      throw new ForbiddenException('Password reset is forbidden');
    }

    this.logger.warn('Resetting admin password');
    const defaultPassword = await this.cryptoService.getDeviceDefaultPassword();

    await this.updateUserPassword(ADMIN_USER_NAME, defaultPassword);
  }

  /**
   * Try to get the user with the provided userLogin
   * If no user with that name is found an UnauthorizedException is thrown
   */
  private async getUserOrThrow(userLogin: string): Promise<IUserData> | never {
    const user = await this.userRepository.getByLogin(userLogin);
    if (user === undefined) {
      this.logger.log(`Login failed: Unknown user "${userLogin}"`);
      throw new UnauthorizedException();
    }

    return user;
  }

  /**
   * Try to get the user with the provided user login and matching password
   * If either no user with that name is found
   * or the provided password does not match the users stored password
   * an UnauthorizedException is thrown
   */
  private async getAuthenticatedUserOrThrow(userLogin: string, password: string) {
    const user = await this.getUserOrThrow(userLogin);

    const isPasswordCorrect = await this.cryptoService.comparePasswords(password, user.passwordHash);
    if (!isPasswordCorrect) {
      this.logger.log(`Login failed for user "${userLogin}": Password does not match`);

      throw new UnauthorizedException();
    }

    this.logger.verbose(`Login for user "${userLogin}" successful`);

    return user;
  }

  /**
   * Update the password hash of the provided user with the hash value of the provided new password
   */
  private async updateUserPassword(userLogin: string, newPassword: string) {
    // TODO: refactor password handling to user.service
    const passwordHash = await this.cryptoService.hashPassword(newPassword);

    await this.userRepository.update(userLogin, { passwordHash });
  }
}
