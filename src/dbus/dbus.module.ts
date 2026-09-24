import { DynamicModule } from '@nestjs/common';
import { registerServiceWithMock } from '../types/utils';
import { AllDbusCommands, DbusCommand } from './cli/dbus.command';
import { LogindServiceProvider } from './interfaces/logind.service';
import { NetworkDeviceServiceProvider } from './interfaces/network-manager/network-device.service';
import { NetworkSettingsServiceProvider } from './interfaces/network-manager/network-settings.service';
import { Systemd1ServiceProvider } from './interfaces/systemd1/systemd1.service';
import { TimeDate1ServiceProvider } from './interfaces/timedate1/timedate1.service';
import { SystemBusServiceProvider } from './system-bus/system-bus.service';

export class DbusModule {
  static register(isProduction: boolean): DynamicModule {
    const services = [
      registerServiceWithMock(LogindServiceProvider, isProduction),
      registerServiceWithMock(Systemd1ServiceProvider, isProduction),
      registerServiceWithMock(NetworkDeviceServiceProvider, isProduction),
      registerServiceWithMock(NetworkSettingsServiceProvider, isProduction),
      registerServiceWithMock(TimeDate1ServiceProvider, isProduction),
    ];

    return {
      global: true,
      module: DbusModule,
      providers: [registerServiceWithMock(SystemBusServiceProvider, isProduction), ...services, ...AllDbusCommands],
      exports: [...services, DbusCommand],
    };
  }
}
