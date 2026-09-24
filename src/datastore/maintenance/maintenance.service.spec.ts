import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceService } from './maintenance.service';
import { PartialMockClass } from '../../types/common';
import { SettingsRepository } from '../settings-repository/settings.repository';
import { DEFAULT_SETTINGS } from '../settings-repository/defaults';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let settingsRepositoryMock: PartialMockClass<SettingsRepository<'authentication'>>;
  const allSettingsKeys = Object.keys(DEFAULT_SETTINGS);
  let boundRepositoryMock: {
    isInitialized: jest.Mock;
    resetDefaults: jest.Mock;
  };

  beforeEach(async () => {
    boundRepositoryMock = {
      isInitialized: jest.fn().mockResolvedValue(false),
      resetDefaults: jest.fn().mockResolvedValue(undefined),
    };

    settingsRepositoryMock = {
      for: jest.fn(() => boundRepositoryMock),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        {
          provide: SettingsRepository,
          useValue: settingsRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resetAllSettingsToDefaults', () => {
    it('should reset all settings  to defaults', async () => {
      await service.resetAllSettingsToDefaults();
      for (const settingsKey of allSettingsKeys) {
        expect(settingsRepositoryMock.for).toHaveBeenCalledWith(settingsKey);
      }

      expect(boundRepositoryMock.isInitialized).toHaveBeenCalledTimes(allSettingsKeys.length);
      expect(boundRepositoryMock.resetDefaults).toHaveBeenCalledTimes(allSettingsKeys.length);
    });

    it('should throw if not all settings are empty', async () => {
      boundRepositoryMock.isInitialized.mockResolvedValue(true);

      await expect(service.resetAllSettingsToDefaults()).rejects.toThrow('not empty');
    });

    it('should NOT throw if not all settings are empty but ignoreExisting is true', async () => {
      boundRepositoryMock.isInitialized.mockResolvedValue(true);
      await service.resetAllSettingsToDefaults(true);
      expect(boundRepositoryMock.resetDefaults).toHaveBeenCalledTimes(allSettingsKeys.length);
    });
  });
});
