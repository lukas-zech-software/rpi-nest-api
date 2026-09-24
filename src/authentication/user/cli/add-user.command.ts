import { CommandRunner, Option, SubCommand } from 'nest-commander';
import { UserService } from '../user.service';
import { ACCESS_ROLES, AccessRole } from '../../constants';

const availableRolesList = ACCESS_ROLES.join(', ');

@SubCommand({
  name: 'add',
  description: 'Add a new user for the API',
})
export class AddUserCommand extends CommandRunner {
  @Option({
    flags: '-u, --username <username>',
    description: 'The username used to login',
    required: true,
  })
  getUsername(val: string): string {
    return val;
  }

  @Option({
    flags: '-p, --password <password>',
    description: 'The password used to login',
    required: true,
  })
  getPassword(val: string): string {
    return val;
  }

  @Option({
    flags: '-r, --roles <roles...>',
    description: `One or multiple roles for the user. Valid roles: ${availableRolesList}`,
    required: true,
  })
  getRoles(role: AccessRole, allRoles: AccessRole[] = []): AccessRole[] {
    if (ACCESS_ROLES.includes(role)) {
      return [...allRoles, role];
    }
    console.log(`"${role}" is not a valid role. Must be one of: ${availableRolesList}`);
    throw new Error('Error parsing roles.');
  }

  @Option({
    flags: '-d, --description',
    description: 'An optional description for the new user',
  })
  getDescription(val: string): string {
    return val;
  }

  constructor(private userService: UserService) {
    super();
  }

  async run(passedParams: string[], options: Record<string, any>): Promise<void> {
    const { username, password, roles, description } = options;

    await this.userService.create({
      login: username,
      password,
      roles,
      description,
    });

    console.log(`Added user "${username}"`);
  }
}
