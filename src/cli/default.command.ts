import { CommandRunner, DefaultCommand, Option } from 'nest-commander';
import { UsersCommand } from '../authentication/user/cli/users.command';
import { AuthenticationCommand } from '../authentication/cli/authentication.command';
import { DatastoreCommand } from '../datastore/cli/datastore.command';
import { DbusCommand } from '../dbus/cli/dbus.command';

@DefaultCommand({
  name: 'rpi-nest-cli',
  description: 'CLI for the rpi-nest-api. Use one of the commands listed below.',
  subCommands: [UsersCommand, AuthenticationCommand, DatastoreCommand, DbusCommand],
})
export class RpiApiCliCommand extends CommandRunner {
  @Option({
    flags: '--verbose',
    description: 'Enable verbose logging output',
  })
  parseVerbose(val: string): string {
    return val;
  }

  async run(): Promise<void> {
    // default namespace command - nothing to do but print the help message
    this.command.help();
  }
}
