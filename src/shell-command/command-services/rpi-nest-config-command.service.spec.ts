import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockClass } from '../../types/common';
import { ChildProcessService } from '../child-process.service';
import { RpiConfigCommandService } from './raspi-config-command.service';

describe('RpiConfigCommandService', () => {
  let service: RpiConfigCommandService;
  let childProcessServiceMock: PartialMockClass<ChildProcessService>;

  beforeEach(async () => {
    childProcessServiceMock = {
      spawnAuthorized: jest.fn().mockResolvedValue(''),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [RpiConfigCommandService, { provide: ChildProcessService, useValue: childProcessServiceMock }],
    }).compile();

    service = module.get<RpiConfigCommandService>(RpiConfigCommandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generic error handling', () => {
    it('should throw an error if raspi-config prints "Usage" help message instead of result', async () => {
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue('Usage:');

      await expect(service.getConfigurationStates(['foo'])).rejects.toThrow('Invalid command!');
    });
  });

  describe('enableConfiguration', () => {
    it('should call raspi-config and with arguments "enabled" followed by the config name', async () => {
      await service.enableConfiguration('ssh');
      expect(childProcessServiceMock.spawnAuthorized).toHaveBeenCalledWith('/usr/bin/raspi-config', ['enable', 'ssh'], {
        shell: true,
      });
    });
  });

  describe('getSupportedConfigurations', () => {
    it('should return a list of strings containing the supported configurations', async () => {
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue(
        'Supported features: gui downclock-cpu perf-governor rpi-nest-con-can',
      );

      const result = await service.getSupportedConfigurations();
      expect(result).toEqual(['gui', 'downclock-cpu', 'perf-governor', 'rpi-nest-con-can']);
    });
  });

  describe('disableConfiguration', () => {
    it('should call raspi-config and with arguments "disable" followed by the config name', async () => {
      await service.disableConfiguration('ssh');
      expect(childProcessServiceMock.spawnAuthorized).toHaveBeenCalledWith(
        '/usr/bin/raspi-config',
        ['disable', 'ssh'],
        { shell: true },
      );
    });
  });

  describe('getConfigurationStates', () => {
    it('should call raspi-config and with arguments availstat followed by all config names ', async () => {
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue('2');

      await service.getConfigurationStates(['ssh', 'foo']);
      expect(childProcessServiceMock.spawnAuthorized).toHaveBeenCalledWith(
        '/usr/bin/raspi-config',
        ['availstat', 'ssh foo'],
        { shell: true },
      );
    });

    it('should return isAvailable=false and isEnabled=false if return value is 2', async () => {
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue('2');

      const [configState] = await service.getConfigurationStates(['ssh']);
      expect(configState.isAvailable).toEqual(false);
      expect(configState.isEnabled).toEqual(false);
    });

    it('should return isAvailable=true and isEnabled=true if return value is 1', async () => {
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue('1');

      const [configState] = await service.getConfigurationStates(['ssh']);
      expect(configState.isAvailable).toEqual(true);
      expect(configState.isEnabled).toEqual(true);
    });

    it('should return isAvailable=true and isEnabled=false if return value is 0', async () => {
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue('0');

      const [configState] = await service.getConfigurationStates(['ssh']);
      expect(configState.isAvailable).toEqual(true);
      expect(configState.isEnabled).toEqual(false);
    });

    it('should return result for each provided config', async () => {
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue('0 1 2');

      const [ssh, foo, bar] = await service.getConfigurationStates(['ssh', 'foo', 'bar']);
      expect(ssh.isAvailable).toEqual(true);
      expect(ssh.isEnabled).toEqual(false);

      expect(foo.isAvailable).toEqual(true);
      expect(foo.isEnabled).toEqual(true);

      expect(bar.isAvailable).toEqual(false);
      expect(bar.isEnabled).toEqual(false);
    });

    it('should throw an error if return value is not 0, 1 or 2', async () => {
      childProcessServiceMock.spawn?.mockResolvedValue('foo');

      await expect(service.getConfigurationStates(['ssh'])).rejects.toThrow('unexpected value');
    });
  });

  describe('getConfigurationStatus', () => {
    it('should call raspi-config with "status"', async () => {
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue('someValue 2');

      await service.getConfigurationStatus('ssh');
      expect(childProcessServiceMock.spawnAuthorized).toHaveBeenCalledWith('/usr/bin/raspi-config', ['status', 'ssh'], {
        shell: true,
      });
    });

    it('should return status and value if raspi-config returns one', async () => {
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue('someValue 2');

      const result = await service.getConfigurationStatus('ssh');
      expect(result.isAvailable).toEqual(false);
      expect(result.isEnabled).toEqual(false);
      expect(result.value).toEqual('someValue');
    });

    it('should return only status if raspi-config returns no value', async () => {
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue('2');

      const result = await service.getConfigurationStatus('ssh');
      expect(result.isAvailable).toEqual(false);
      expect(result.isEnabled).toEqual(false);
      expect(result.value).not.toBeDefined();
    });
  });
});
