import { CommandRunner, SubCommand } from 'nest-commander';
import { ResetAdminPasswordCommand } from './reset-admin-password.command';
import { ResetDefaults } from './reset-defaults';

const authSubCommands = [ResetAdminPasswordCommand, ResetDefaults];

@SubCommand({
  name: 'authentication',
  aliases: ['auth'],
  description: 'Manage the authentication settings the API',
  subCommands: authSubCommands,
})
export class AuthenticationCommand extends CommandRunner {
  async run(): Promise<void> {
    // default namespace command - nothing to do but print the help message
    this.command.help();
  }
}

// TODO: Check why UsersCommand.registerWithSubCommands() doesn't work
export const AllAuthenticationCommands = [AuthenticationCommand, ...authSubCommands];
