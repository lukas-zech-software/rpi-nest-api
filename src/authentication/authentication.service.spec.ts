import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { CryptoService } from './crypto/crypto.service';
import { MockClass, PartialMockClass } from '../types/common';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CreateUserData, UserRepository } from '../datastore/user-repository/user.repository';
import { SettingsRepository } from '../datastore/settings-repository/settings.repository';
import { AuthenticationSettings } from '../datastore/settings-repository/types';
import { ADMIN_USER_NAME } from './constants';

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  let userRepositoryMock: PartialMockClass<UserRepository>;
  let settingsRepositoryMock: PartialMockClass<SettingsRepository<'authentication'>>;
  let cryptoServiceMock: MockClass<CryptoService>;
  let jwtServiceMock: PartialMockClass<JwtService>;

  function getTestHash(password: string) {
    return password + '-hashed';
  }

  const testJwtToken = 'test.jwt.token';
  const testPassword = 'test-password';
  const testPasswordHash = getTestHash(testPassword);
  const testUserLogin = 'test-user-login';
  const testDefaultPassword = 'test-default-password';
  let testUser: CreateUserData;
  let testSettings: AuthenticationSettings;

  beforeEach(async () => {
    testUser = {
      description: 'test-description',
      passwordHash: testPasswordHash,
      roles: ['user'],
    };
    testSettings = {
      isAdminPasswordResetEnabled: true,
    };
    userRepositoryMock = {
      getByLogin: jest.fn((login) => (login === testUserLogin ? testUser : undefined)),
      update: jest.fn(),
    };

    settingsRepositoryMock = {
      for: jest.fn(() => ({
        get: async () => testSettings,
      })),
    };

    cryptoServiceMock = {
      comparePasswords: jest.fn(async (pw, hash) => getTestHash(pw) === hash),
      hashPassword: jest.fn(async (pw) => getTestHash(pw)),
      getDeviceDefaultPassword: jest.fn().mockResolvedValue(testDefaultPassword),
      generateRandomString: jest.fn(),
    };

    jwtServiceMock = {
      signAsync: jest.fn().mockResolvedValue(testJwtToken),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: SettingsRepository,
          useValue: settingsRepositoryMock,
        },
        {
          provide: CryptoService,
          useValue: cryptoServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    authenticationService = module.get(AuthenticationService);
  });

  it('should be defined', () => {
    expect(authenticationService).toBeDefined();
  });

  describe('signIn', () => {
    it('should return a token if user login and password are valid', async () => {
      const result = await authenticationService.login(testUserLogin, testPassword);

      expect(result.token).toEqual(testJwtToken);
      expect(userRepositoryMock.getByLogin).toHaveBeenCalledWith(testUserLogin);
      expect(cryptoServiceMock.comparePasswords).toHaveBeenCalledWith(testPassword, testPasswordHash);
    });

    it('should throw if user was not found', async () => {
      await expect(authenticationService.login('wrong-username', testPassword)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password does not match', async () => {
      await expect(authenticationService.login(testUserLogin, 'wrong-password')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updatePassword', () => {
    const newTestPassword = 'new-test-password';
    const newTestPasswordHash = getTestHash(newTestPassword);

    it('should update the users password if username and current password are valid', async () => {
      await authenticationService.updatePassword(testUserLogin, testPassword, newTestPassword);

      expect(userRepositoryMock.getByLogin).toHaveBeenCalledWith(testUserLogin);
      expect(cryptoServiceMock.comparePasswords).toHaveBeenCalledWith(testPassword, testPasswordHash);
      expect(cryptoServiceMock.hashPassword).toHaveBeenCalledWith(newTestPassword);
      expect(userRepositoryMock.update).toHaveBeenCalledWith(testUserLogin, {
        passwordHash: newTestPasswordHash,
      });
    });

    it('should throw if user was not found', async () => {
      await expect(
        authenticationService.updatePassword('wrong-username', testPassword, newTestPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password does not match', async () => {
      await expect(
        authenticationService.updatePassword(testUserLogin, 'wrong-password', newTestPassword),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('resetPassword', () => {
    it('should should reset the admin users password to the device default password if password reset is enabled', async () => {
      await authenticationService.resetAdminPassword();

      expect(cryptoServiceMock.getDeviceDefaultPassword).toHaveBeenCalled();
      expect(cryptoServiceMock.hashPassword).toHaveBeenCalledWith(testDefaultPassword);
      expect(userRepositoryMock.update).toHaveBeenCalledWith(ADMIN_USER_NAME, {
        passwordHash: getTestHash(testDefaultPassword),
      });
    });

    it('should throw if password reset is not enabled', async () => {
      testSettings.isAdminPasswordResetEnabled = false;
      await expect(authenticationService.resetAdminPassword()).rejects.toThrow(ForbiddenException);
    });
  });
});
