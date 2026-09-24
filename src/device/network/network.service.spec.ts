import { Test, TestingModule } from '@nestjs/testing';
import { apiConfig } from '../../config/config';
import { NetworkService } from './network.service';
import { NetworkDeviceService } from '../../dbus/interfaces/network-manager/network-device.service';
import { NetworkSettingsService } from '../../dbus/interfaces/network-manager/network-settings.service';

describe('NetworkService', () => {
  let service: NetworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NetworkService,
        { provide: NetworkDeviceService, useValue: {} },
        { provide: NetworkSettingsService, useValue: {} },
        { provide: apiConfig.KEY, useValue: {} },
      ],
    }).compile();

    service = module.get<NetworkService>(NetworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
