import { CommandRunner, Option, SubCommand } from 'nest-commander';
import { UserService } from '../user.service';
@SubCommand({
  name: 'remove',
  description: 'Remove a user',
})
export class RemoveUserCommand extends CommandRunner {
  @Option({
    flags: '-u, --username <username>',
    description: 'The name of the user to remove',
    required: true,
  })
  getUsername(val: string): string {
    return val;
  }

  constructor(private userService: UserService) {
    super();
  }

  async run(passedParams: string[], options: Record<string, any>): Promise<void> {
    const { username } = options;
    await this.userService.remove(username);
    console.log(`Removed user "${username}"`);
  }
}
