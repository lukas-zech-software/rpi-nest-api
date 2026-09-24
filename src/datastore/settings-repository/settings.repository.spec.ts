import { Test, TestingModule } from '@nestjs/testing';
import { SettingsRepository } from './settings.repository';
import { MockClass, PartialMockClass } from '../../types/common';
import { LmbdStorageProvider } from '../storage/lmbd-storage.provider';
import { Database } from 'lmdb';
import { TestSettings } from './types';
import { DEFAULT_SETTINGS } from './defaults';

describe('SettingsRepository', () => {
  let dbMock: PartialMockClass<Database>;
  let storageServiceMock: MockClass<LmbdStorageProvider<any>>;
  const TestSettingsKey = 'test';
  let settingsRepository: SettingsRepository<typeof TestSettingsKey>;

  const testSettings: TestSettings = {
    foo: 'test-foo',
    bar: 'test-bar',
  };

  beforeEach(async () => {
    dbMock = {
      get: jest.fn(),
      put: jest.fn(),
      getKeys: jest.fn().mockReturnValue({ asArray: [] }),
    };
    storageServiceMock = {
      getStore: jest.fn().mockReturnValue(dbMock),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingsRepository, { provide: LmbdStorageProvider, useValue: storageServiceMock }],
    }).compile();

    settingsRepository = module.get(SettingsRepository);
  });

  it('should be defined', () => {
    expect(settingsRepository).toBeDefined();
  });

  it('should open "settings" database', () => {
    expect(storageServiceMock.getStore).toHaveBeenCalledWith('settings', expect.anything());
  });

  describe('get', () => {
    it('should get value with provided login from database', async () => {
      dbMock.get?.mockReturnValue(testSettings);

      await settingsRepository.for(TestSettingsKey).get();

      expect(dbMock.get).toHaveBeenCalledWith(TestSettingsKey);
    });

    it('should throw an error if settings with bound key is not initialized', async () => {
      dbMock.get?.mockReturnValue(undefined);

      await expect(settingsRepository.for(TestSettingsKey).get()).rejects.toThrow('not initialized');

      expect(dbMock.put).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update only partial data for settings with bound key', async () => {
      dbMock.get?.mockReturnValue(testSettings);

      await settingsRepository.for(TestSettingsKey).update({ foo: 'xxx' });

      expect(dbMock.put).toHaveBeenCalledWith(TestSettingsKey, { ...testSettings, foo: 'xxx' });
    });

    it('should throw an error if settings with bound key is not initialized', async () => {
      dbMock.get?.mockReturnValue(undefined);

      await expect(settingsRepository.for(TestSettingsKey).update({ foo: 'xxx' })).rejects.toThrow('not initialized');

      expect(dbMock.put).not.toHaveBeenCalled();
    });
  });

  describe('resetDefaults', () => {
    it('should reset data for settings with bound key to defined defaults even if not set before', async () => {
      dbMock.get?.mockReturnValue(undefined);

      await settingsRepository.for(TestSettingsKey).resetDefaults();

      expect(dbMock.put).toHaveBeenCalledWith(TestSettingsKey, DEFAULT_SETTINGS[TestSettingsKey]);
    });
  });
});
