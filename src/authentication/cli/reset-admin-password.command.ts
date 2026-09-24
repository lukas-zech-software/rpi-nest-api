import { CommandRunner, SubCommand } from 'nest-commander';
import { AuthenticationService } from '../authentication.service';

@SubCommand({
  name: 'reset-admin-password',
  description: 'Reset the admin password to the default device password.',
})
export class ResetAdminPasswordCommand extends CommandRunner {
  constructor(private readonly authenticationService: AuthenticationService) {
    super();
  }

  async run(): Promise<void> {
    await this.authenticationService.resetAdminPassword();
  }
}
