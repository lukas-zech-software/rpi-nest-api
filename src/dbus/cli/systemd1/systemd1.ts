import { CommandRunner, SubCommand } from 'nest-commander';
import { StartUnitCommand } from './StartUnit';
import { ShowUnitCommand } from './ShowUnit';

const systemd1SubCommands = [StartUnitCommand, ShowUnitCommand];

@SubCommand({
  name: 'systemd1',
  description: 'Invoke the org.freedesktop.systemd1 interface',
  subCommands: systemd1SubCommands,
})
export class Systemd1Command extends CommandRunner {
  async run(): Promise<void> {
    // default namespace command - nothing to do but print the help message
    this.command.help();
  }
}

export const AllSystemd1Commands = [Systemd1Command, ...systemd1SubCommands];
