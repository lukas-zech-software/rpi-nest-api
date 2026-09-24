import { CommandRunner, SubCommand } from 'nest-commander';
import { AddUserCommand } from './add-user.command';
import { RemoveUserCommand } from './remove-user.command';
import { CreateAdminCommand } from './create-admin.command';

const userSubCommands = [AddUserCommand, RemoveUserCommand, CreateAdminCommand];

@SubCommand({
  name: 'users',
  description: 'Manage users for the API',
  subCommands: userSubCommands,
})
export class UsersCommand extends CommandRunner {
  async run(): Promise<void> {
    // default namespace command - nothing to do but print the help message
    this.command.help();
  }
}

// TODO: Check why UsersCommand.registerWithSubCommands() doesn't work
export const AllUserCommands = [UsersCommand, ...userSubCommands];
