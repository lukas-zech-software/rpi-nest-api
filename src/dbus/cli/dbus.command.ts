import { CommandRunner, SubCommand } from 'nest-commander';
import { IntrospectCommand } from './introspect';
import { AllSystemd1Commands, Systemd1Command } from './systemd1/systemd1';
import { AllNetworkManagerCommands, NetworkManagerCommand } from './network-manager/network-manager';

const dbusSubCommands = [IntrospectCommand, Systemd1Command, NetworkManagerCommand];

@SubCommand({
  name: 'dbus',
  description: 'Manage the authentication settings the API',
  subCommands: dbusSubCommands,
})
export class DbusCommand extends CommandRunner {
  async run(): Promise<void> {
    // default namespace command - nothing to do but print the help message
    this.command.help();
  }
}

// TODO: Check why UsersCommand.registerWithSubCommands() doesn't work
export const AllDbusCommands = [DbusCommand, ...dbusSubCommands, ...AllSystemd1Commands, ...AllNetworkManagerCommands];
