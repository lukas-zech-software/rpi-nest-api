import { Injectable, Logger } from '@nestjs/common';
import { LogindService } from '../../dbus/interfaces/logind.service';

@Injectable()
export class DeviceAdminService {
  private readonly logger = new Logger(DeviceAdminService.name);

  constructor(private logindService: LogindService) {}

  public async reboot(): Promise<void> {
    this.logger.warn('Reboot triggered');
    await this.logindService.Reboot();
  }
}
