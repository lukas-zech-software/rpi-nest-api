import { Test, TestingModule } from '@nestjs/testing';
import { IUserData, UserRepository } from './user.repository';
import { MockClass, PartialMockClass } from '../../types/common';
import { LmbdStorageProvider } from '../storage/lmbd-storage.provider';
import { Database } from 'lmdb';

describe('UserRepository', () => {
  let dbMock: PartialMockClass<Database>;
  let storageServiceMock: MockClass<LmbdStorageProvider<any>>;
  let userRepository: UserRepository;

  const testLogin = 'some-login';
  const testUser: IUserData = {
    login: 'some-login',
    description: 'some-description',
    passwordHash: 'xxx',
    roles: ['user'],
    created: expect.any(Number),
    modified: expect.any(Number),
  };

  beforeEach(async () => {
    dbMock = {
      get: jest.fn(),
      getRange: jest.fn(),
      put: jest.fn(),
      remove: jest.fn(),
      doesExist: jest.fn().mockReturnValue(false),
      getKeys: jest.fn().mockReturnValue({ asArray: [] }),
    };
    storageServiceMock = {
      getStore: jest.fn().mockReturnValue(dbMock),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepository, { provide: LmbdStorageProvider, useValue: storageServiceMock }],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('should open "users" database', () => {
    expect(storageServiceMock.getStore).toHaveBeenCalledWith('users', expect.anything());
  });

  describe('getByLogin', () => {
    it('should get value with provided login from database', async () => {
      await userRepository.getByLogin(testLogin);
      expect(dbMock.get).toHaveBeenCalledWith(testLogin);
    });
  });

  describe('create', () => {
    it('should create user with provided login', async () => {
      await userRepository.create(testLogin, testUser);
      // must check with login not username
      expect(dbMock.doesExist).toHaveBeenCalledWith(testLogin);

      expect(dbMock.put).toHaveBeenCalledWith(testLogin, testUser);
    });

    it('should throw an error if user with this login already exists', async () => {
      dbMock.doesExist?.mockReturnValue(true);

      await expect(userRepository.create(testLogin, testUser)).rejects.toThrow('User already exists');
      expect(dbMock.put).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update data for user with provided login', async () => {
      dbMock.get?.mockReturnValue(testUser);

      await userRepository.update(testLogin, { description: 'foo' });

      expect(dbMock.put).toHaveBeenCalledWith(testLogin, { ...testUser, description: 'foo' });
    });

    it('should throw an error if no user with this login exists', async () => {
      dbMock.get?.mockReturnValue(undefined);

      await expect(userRepository.update(testLogin, { description: 'foo' })).rejects.toThrow('unknown user');

      expect(dbMock.put).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove user with provided login', async () => {
      dbMock.doesExist?.mockReturnValue(true);

      await userRepository.remove(testLogin);
      expect(dbMock.doesExist).toHaveBeenCalledWith(testLogin);

      expect(dbMock.remove).toHaveBeenCalledWith(testLogin);
    });

    it('should throw an error if no user with this login exists', async () => {
      dbMock.doesExist?.mockReturnValue(false);

      await expect(userRepository.remove(testLogin)).rejects.toThrow('unknown user');
      expect(dbMock.remove).not.toHaveBeenCalled();
    });
  });
});
