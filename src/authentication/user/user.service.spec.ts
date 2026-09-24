import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../datastore/user-repository/user.repository';
import { MockClass, PartialMockClass } from '../../types/common';
import { ADMIN_USER_NAME } from '../constants';
import { CryptoService } from '../crypto/crypto.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepositoryMock: PartialMockClass<UserRepository>;
  let cryptoServiceMock: MockClass<CryptoService>;

  const testUserLogin = 'test-user-login';
  const testPassword = 'test-password';
  const testDefaultPassword = 'test-default-password';

  function getTestHash(password: string) {
    return password + '-hashed';
  }

  beforeEach(async () => {
    userRepositoryMock = {
      update: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
    };

    cryptoServiceMock = {
      comparePasswords: jest.fn(async (pw, hash) => getTestHash(pw) === hash),
      hashPassword: jest.fn(async (pw) => getTestHash(pw)),
      getDeviceDefaultPassword: jest.fn().mockResolvedValue(testDefaultPassword),
      generateRandomString: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: CryptoService,
          useValue: cryptoServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create new User', async () => {
      await service.create({ login: testUserLogin, password: testPassword, roles: ['user'] });

      expect(cryptoServiceMock.hashPassword).toHaveBeenCalledWith(testPassword);
      expect(userRepositoryMock.create).toHaveBeenCalledWith(testUserLogin, {
        passwordHash: getTestHash(testPassword),
        roles: ['user'],
      });
    });

    it('should throw Error when trying to create admin user', async () => {
      await expect(service.create({ login: ADMIN_USER_NAME, password: testPassword, roles: ['user'] })).rejects.toThrow(
        'reserved',
      );
    });
  });

  describe('update', () => {
    it('should update  User', async () => {
      await service.update({ login: testUserLogin, description: 'test' });

      expect(userRepositoryMock.update).toHaveBeenCalledWith(testUserLogin, { description: 'test' });
    });

    it('should throw Error when trying to update admin user', async () => {
      await expect(service.update({ login: ADMIN_USER_NAME, description: 'test' })).rejects.toThrow('reserved');
    });
  });

  describe('createAdmin', () => {
    it('should create admin User', async () => {
      await service.createAdmin();

      expect(cryptoServiceMock.getDeviceDefaultPassword).toHaveBeenCalledWith();
      expect(cryptoServiceMock.hashPassword).toHaveBeenCalledWith(testDefaultPassword);
      expect(userRepositoryMock.create).toHaveBeenCalledWith(ADMIN_USER_NAME, {
        passwordHash: getTestHash(testDefaultPassword),
        roles: ['admin'],
        description: expect.anything(),
      });
    });
  });

  describe('remove', () => {
    it('should remove user', async () => {
      await service.remove(testUserLogin);

      expect(userRepositoryMock.remove).toHaveBeenCalledWith(testUserLogin);
    });

    it('should throw Error when trying to remove admin user', async () => {
      await expect(service.remove(ADMIN_USER_NAME)).rejects.toThrow('reserved');
    });
  });
});
