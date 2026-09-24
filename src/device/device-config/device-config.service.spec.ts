import { Test, TestingModule } from '@nestjs/testing';
import { DeviceConfigService } from './device-config.service';
import { RpiConfigCommandService } from '../../shell-command/command-services/raspi-config-command.service';
import { MockClass } from '../../types/common';

describe('DeviceConfigService', () => {
  let service: DeviceConfigService;
  let rpiConfigCommandServiceMock: MockClass<RpiConfigCommandService>;

  const testConfigList = ['foo', 'bar'];

  beforeEach(async () => {
    rpiConfigCommandServiceMock = {
      disableConfiguration: jest.fn().mockResolvedValue(undefined),
      enableConfiguration: jest.fn().mockResolvedValue(undefined),
      getConfigurationStatus: jest.fn().mockResolvedValue({
        isAvailable: true,
        isEnabled: true,
        value: 'someValue',
      }),
      getConfigurationStates: jest.fn().mockResolvedValue([
        {
          isAvailable: true,
          isEnabled: true,
        },
        {
          isAvailable: false,
          isEnabled: false,
        },
      ]),
      getSupportedConfigurations: jest.fn().mockResolvedValue(testConfigList),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceConfigService,
        {
          provide: RpiConfigCommandService,
          useValue: rpiConfigCommandServiceMock,
        },
      ],
    }).compile();

    service = module.get<DeviceConfigService>(DeviceConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllSupportedConfigurations', () => {
    it('should return all configurations', async () => {
      const results = await service.getAllSupportedConfigurations();

      expect(Array.isArray(results)).toEqual(true);

      for (const result of results) {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('isEnabled');
        expect(result).toHaveProperty('isAvailable');
      }
    });
  });

  describe('getConfigurationStatus', () => {
    it('should return configuration status and value', async () => {
      const result = await service.getConfiguration('nodered');

      expect(rpiConfigCommandServiceMock.getConfigurationStatus).toHaveBeenCalledWith('nodered');
      expect(result).toBeDefined();
      expect(result?.id).toEqual('nodered');
      expect(result?.isEnabled).toEqual(true);
      expect(result?.isAvailable).toEqual(true);
      expect(result?.value).toEqual('someValue');
    });
  });

  describe('update', () => {
    it('should enableConfiguration if isEnabled is true', async () => {
      await service.setConfiguration('nodered', { isEnabled: true, value: '123' });
      expect(rpiConfigCommandServiceMock.enableConfiguration).toHaveBeenCalledWith('nodered', '123');
      expect(rpiConfigCommandServiceMock.disableConfiguration).not.toHaveBeenCalled();
    });

    it('should disableConfiguration if isEnabled is false', async () => {
      await service.setConfiguration('nodered', { isEnabled: false });
      expect(rpiConfigCommandServiceMock.disableConfiguration).toHaveBeenCalledWith('nodered');
      expect(rpiConfigCommandServiceMock.enableConfiguration).not.toHaveBeenCalled();
    });
  });
});
