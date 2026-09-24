import { CommandRunner, SubCommand } from 'nest-commander';
import { UserService } from '../user.service';

@SubCommand({
  name: 'create-admin',
  description: 'Create the admin user. Only works on an empty database',
})
export class CreateAdminCommand extends CommandRunner {
  constructor(private userService: UserService) {
    super();
  }

  async run(): Promise<void> {
    await this.userService.createAdmin();
    console.log(`Admin user created`);
  }
}
