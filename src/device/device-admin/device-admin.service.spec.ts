import { Test, TestingModule } from '@nestjs/testing';
import { DeviceAdminService } from './device-admin.service';
import { MockClass } from '../../types/common';
import { LogindService } from '../../dbus/interfaces/logind.service';

describe('DeviceAdminService', () => {
  let service: DeviceAdminService;
  let logindServiceMock: MockClass<LogindService>;

  beforeEach(async () => {
    logindServiceMock = {
      Reboot: jest.fn().mockResolvedValue(undefined),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceAdminService, { provide: LogindService, useValue: logindServiceMock }],
    }).compile();

    service = module.get<DeviceAdminService>(DeviceAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
