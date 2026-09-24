import { Injectable, Logger } from '@nestjs/common';
import { getServicesWithMock } from '../../../types/utils';
import { DBusProxy, SystemBusService } from '../../system-bus/system-bus.service';
import { ManagerMethods, UnitProperties } from './systemd1.types';

/**
 * org.freedesktop.systemd1 — The D-Bus interface of systemd
 * {@see https://www.freedesktop.org/software/systemd/man/org.freedesktop.systemd1.html}
 *
 * CLI examples
 * ```shell
 * $ dbus-send --system --type=method_call --print-reply --dest=org.freedesktop.systemd1 /org/freedesktop/systemd1 org.freedesktop.systemd1.Manager.StartUnit string:'' string:''
 * $ gdbus introspect --system --dest org.freedesktop.systemd1 --object-path /org/freedesktop/systemd1/unit/sos_2dreport_2eservice
 * ```
 */
@Injectable()
export class Systemd1Service implements ISystemd1Service {
  private readonly proxy: DBusProxy;
  private readonly logger = new Logger(Systemd1Service.name);

  constructor(systemBus: SystemBusService) {
    this.proxy = systemBus.createProxy('org.freedesktop.systemd1', '/org/freedesktop/systemd1');
  }

  public async StartUnit(unitName: string, mode = 'fail'): Promise<string> {
    this.logger.log(`Starting systemd unit ${unitName} with mode ${mode}}`);
    const manager = await this.getManager();
    return manager.StartUnit(unitName, mode);
  }

  public async RestartUnit(unitName: string, mode = 'fail'): Promise<string> {
    this.logger.log(`Restarting systemd unit ${unitName}} with mode ${mode}}`);
    const manager = await this.getManager();
    return manager.RestartUnit(unitName, mode);
  }

  public async LoadUnit(unitName: string): Promise<string> {
    this.logger.log(`Loading systemd unit ${unitName}}`);
    const manager = await this.getManager();
    return manager.LoadUnit(unitName);
  }

  public async GetUnitProperties(unit: string): Promise<UnitProperties | undefined> {
    const unitPath = await this.LoadUnit(unit);
    const properties = await this.proxy.getPropertiesInterface<UnitProperties>(unitPath);
    return properties.GetAllUnwrapped(`org.freedesktop.systemd1.Unit`);
  }

  private getManager(): Promise<ManagerMethods> {
    return this.proxy.getMethodInterface<ManagerMethods>('org.freedesktop.systemd1.Manager');
  }
}

interface ISystemd1Service {
  StartUnit(unitName: string, mode: string): Promise<string>;

  RestartUnit(unitName: string, mode: string): Promise<string>;

  LoadUnit(unitName: string): Promise<string>;

  GetUnitProperties(unit: string): Promise<UnitProperties | undefined>;
}

@Injectable()
export class Systemd1ServiceMock implements ISystemd1Service {
  async StartUnit(): Promise<string> {
    return '';
  }
  async RestartUnit(): Promise<string> {
    return '';
  }

  async LoadUnit(): Promise<string> {
    return '';
  }

  async GetUnitProperties(): Promise<UnitProperties | undefined> {
    return;
  }
}

export const Systemd1ServiceProvider = getServicesWithMock<ISystemd1Service>(Systemd1Service, Systemd1ServiceMock);
