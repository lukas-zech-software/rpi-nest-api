import { CommandRunner, SubCommand } from 'nest-commander';
import { ResetAllDefaults } from './reset-all-defaults';

const dbSubCommands = [ResetAllDefaults];

@SubCommand({
  name: 'datastore',
  aliases: ['db'],
  description: 'Manage the datastore of the API',
  subCommands: dbSubCommands,
})
export class DatastoreCommand extends CommandRunner {
  async run(): Promise<void> {
    // default namespace command - nothing to do but print the help message
    this.command.help();
  }
}

// TODO: Check why DatastoreCommand.registerWithSubCommands() doesn't work
export const AllDataStoreCommands = [DatastoreCommand, ...dbSubCommands];
