import { CommandRunner, SubCommand } from 'nest-commander';
import { ShowAllDevices } from './ShowAllDevices';
import { SetDHCP } from './SetDHCP';

// TODO: Add Subcommand for updating settings
const NetworkManagerSubCommands = [ShowAllDevices, SetDHCP];

@SubCommand({
  name: 'network-manager',
  description: 'Invoke the org.freedesktop.NetworkManager interface',
  subCommands: NetworkManagerSubCommands,
})
export class NetworkManagerCommand extends CommandRunner {
  async run(): Promise<void> {
    // default namespace command - nothing to do but print the help message
    this.command.help();
  }
}

export const AllNetworkManagerCommands = [NetworkManagerCommand, ...NetworkManagerSubCommands];
