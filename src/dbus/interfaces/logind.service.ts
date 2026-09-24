import { getServicesWithMock } from '../../types/utils';
import { DBusProxy, SystemBusService } from '../system-bus/system-bus.service';
import { Injectable } from '@nestjs/common';

/**
 * org.freedesktop.login1.Manager
 * {@see https://www.freedesktop.org/software/systemd/man/org.freedesktop.login1.html#The%20Manager%20Object}
 */
interface Manager {
  Reboot(interactive: boolean): Promise<void>;
}

interface ILogindService {
  Reboot(): Promise<void>;
}

/**
 * org.freedesktop.login1 — The D-Bus interface of systemd-logind
 * {@see https://www.freedesktop.org/software/systemd/man/org.freedesktop.login1.html}
 */
@Injectable()
export class LogindService implements ILogindService {
  private readonly logindProxy: DBusProxy;

  constructor(private systemBus: SystemBusService) {
    this.logindProxy = systemBus.createProxy('org.freedesktop.login1', '/org/freedesktop/login1');
  }

  public async Reboot(): Promise<void> {
    const loginManagerMethods = await this.logindProxy.getMethodInterface<Manager>('org.freedesktop.login1.Manager');
    return loginManagerMethods.Reboot(false);
  }
}

@Injectable()
export class LogindServiceMock implements ILogindService {
  async Reboot(): Promise<void> {
    return;
  }
}

export const LogindServiceProvider = getServicesWithMock<ILogindService>(LogindService, LogindServiceMock);
