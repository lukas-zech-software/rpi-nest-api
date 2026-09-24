import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockClass } from '../../types/common';
import { ChildProcessService } from '../child-process.service';
import { VcGenCmdCommandService } from './vcgencmd-command.service';

describe('VcGenCmdCommandService', () => {
  let service: VcGenCmdCommandService;
  let childProcessServiceMock: PartialMockClass<ChildProcessService>;

  beforeEach(async () => {
    childProcessServiceMock = {
      spawnAuthorized: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [VcGenCmdCommandService, { provide: ChildProcessService, useValue: childProcessServiceMock }],
    }).compile();

    service = module.get<VcGenCmdCommandService>(VcGenCmdCommandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTemperature', () => {
    it('should invoke vcgencmd with spawnAuthorized and parameter measure_temp and return parsed result', async () => {
      const testTemperature = "temp=42.13'C";
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue(testTemperature);

      const temperature = await service.getTemperature();
      expect(temperature).toEqual(42.13);
      expect(childProcessServiceMock.spawnAuthorized).toHaveBeenCalledWith('/usr/bin/vcgencmd', ['measure_temp'], {
        shell: true,
      });
    });

    it('should throw on unparsable result', async () => {
      const testTemperature = "temp=foo'F";
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue(testTemperature);

      await expect(service.getTemperature()).rejects.toThrow('unparsable');
    });
  });

  describe('getCoreVoltage', () => {
    it('should invoke vcgencmd with spawnAuthorized and parameter measure_temp and return parsed result', async () => {
      const testVoltage = 'volt=13.37V';
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue(testVoltage);

      const temperature = await service.getCoreVoltage();
      expect(temperature).toEqual(13.37);
      expect(childProcessServiceMock.spawnAuthorized).toHaveBeenCalledWith(
        '/usr/bin/vcgencmd',
        ['measure_volts core'],
        { shell: true },
      );
    });

    it('should throw on unparsable result', async () => {
      const testTemperature = 'volt=fooV';
      childProcessServiceMock.spawnAuthorized?.mockResolvedValue(testTemperature);

      await expect(service.getCoreVoltage()).rejects.toThrow('unparsable');
    });
  });
});
