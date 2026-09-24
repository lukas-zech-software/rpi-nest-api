import { Test, TestingModule } from '@nestjs/testing';
import { DeviceStatusService } from './device-status.service';
import { OperatingSystemService } from './os/operating-system/operating-system.service';
import { RasPiSerialCommandService } from '../../shell-command/command-services/pi-serial-command.service';
import { VcGenCmdCommandService } from '../../shell-command/command-services/vcgencmd-command.service';
import { UpTimeCommandService } from '../../shell-command/command-services/uptime-command.service';
import { DfCommandService, DiskSpaceInformation } from '../../shell-command/command-services/df-command.service';
import { MockClass } from '../../types/common';

describe('DeviceStatusService', () => {
  let service: DeviceStatusService;
  let operatingSystemServiceMock: MockClass<OperatingSystemService>;
  let rasPiSerialCommandServiceMock: MockClass<RasPiSerialCommandService>;
  let vcGenCmdCommandServiceMock: MockClass<VcGenCmdCommandService>;
  let upTimeCommandServiceMock: MockClass<UpTimeCommandService>;
  let dfCommandServiceMock: MockClass<DfCommandService>;

  const testSerial = '123-345';
  const testVoltage = 123;
  const testTemperature = 789;
  const testUptime = Date.now();
  const testHostname = 'localhorst';
  const testDiskSpaceInfo: DiskSpaceInformation = {
    available: 159,
    used: 753,
  };

  beforeEach(async () => {
    operatingSystemServiceMock = {
      getHostname: jest.fn().mockReturnValue(testHostname),
    };
    rasPiSerialCommandServiceMock = {
      getSerial: jest.fn().mockResolvedValue(testSerial),
      getDefaultPassword: jest.fn().mockResolvedValue(''),
    };
    vcGenCmdCommandServiceMock = {
      getCoreVoltage: jest.fn().mockResolvedValue(testVoltage),
      getTemperature: jest.fn().mockResolvedValue(testTemperature),
    };
    upTimeCommandServiceMock = {
      getUpTime: jest.fn().mockResolvedValue(testUptime),
    };
    dfCommandServiceMock = {
      getDiskSpaceInformation: jest.fn().mockResolvedValue(testDiskSpaceInfo),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceStatusService,
        { provide: OperatingSystemService, useValue: operatingSystemServiceMock },
        { provide: RasPiSerialCommandService, useValue: rasPiSerialCommandServiceMock },
        { provide: VcGenCmdCommandService, useValue: vcGenCmdCommandServiceMock },
        { provide: UpTimeCommandService, useValue: upTimeCommandServiceMock },
        { provide: DfCommandService, useValue: dfCommandServiceMock },
      ],
    }).compile();

    service = module.get<DeviceStatusService>(DeviceStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentStatus', () => {
    it('should get correct status data from the correct services', async () => {
      const status = await service.getCurrentStatus();
      expect(status).toBeDefined();
      expect(status.serialNumber).toEqual(testSerial);
      expect(status.uptime).toEqual(testUptime);
      expect(status.hostname).toEqual(testHostname);
      expect(status.cpu.temperature).toEqual(testTemperature);
      expect(status.cpu.voltage).toEqual(testVoltage);
      expect(status.fs.available).toEqual(testDiskSpaceInfo.available);
      expect(status.fs.used).toEqual(testDiskSpaceInfo.used);

      expect(operatingSystemServiceMock.getHostname).toHaveBeenCalled();
      expect(rasPiSerialCommandServiceMock.getSerial).toHaveBeenCalled();
      expect(vcGenCmdCommandServiceMock.getCoreVoltage).toHaveBeenCalled();
      expect(vcGenCmdCommandServiceMock.getTemperature).toHaveBeenCalled();
      expect(upTimeCommandServiceMock.getUpTime).toHaveBeenCalled();
      expect(dfCommandServiceMock.getDiskSpaceInformation).toHaveBeenCalled();
    });
  });
});
