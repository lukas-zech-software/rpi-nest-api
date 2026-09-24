import { DynamicModule } from '@nestjs/common';
import { registerServiceWithMock } from '../types/utils';
import { ChildProcessModule } from './child-process.service';
import { DfCommand } from './command-services/df-command.service';
import { DpkgCommand } from './command-services/dpkg-command.service';
import { JournalCtlCommand } from './command-services/journalctl.service';
import { RasPiSerialCommand } from './command-services/pi-serial-command.service';
import { RpiConfigCommand } from './command-services/raspi-config-command.service';
import { UpTimeCommand } from './command-services/uptime-command.service';
import { VcGenCmdCommand } from './command-services/vcgencmd-command.service';

export class ShellCommandModule {
  static register(isProduction: boolean): DynamicModule {
    /**
     * Shell commands can only work on a real device
     * Therefor this module returns a mock implementation in all other environments
     */
    // TODO: Replace only ChildProcessService with mock
    const commandServices = [
      registerServiceWithMock(UpTimeCommand, isProduction),
      registerServiceWithMock(DfCommand, isProduction),
      registerServiceWithMock(RasPiSerialCommand, isProduction),
      registerServiceWithMock(RpiConfigCommand, isProduction),
      registerServiceWithMock(VcGenCmdCommand, isProduction),
      registerServiceWithMock(DpkgCommand, isProduction),
      registerServiceWithMock(JournalCtlCommand, isProduction),
    ];

    return {
      global: true,
      module: ShellCommandModule,
      providers: [registerServiceWithMock(ChildProcessModule, isProduction), ...commandServices],
      exports: commandServices,
    };
  }
}
