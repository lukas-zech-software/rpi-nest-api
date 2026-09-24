import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { IUserData, UserRepository } from '../../datastore/user-repository/user.repository';
import { ADMIN_USER_NAME } from '../constants';
import { CryptoService } from '../crypto/crypto.service';
import { ListUserDto, UpdateUserDto, UserDto } from '../dto/user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private userRepository: UserRepository, private cryptoService: CryptoService) {}

  async getAllUsers(): Promise<ListUserDto[]> {
    const allUsers = await this.userRepository.getAll();
    // TODO: Use class-transformer to sanitize data
    allUsers.forEach((x: Partial<IUserData>) => delete x.passwordHash);
    return allUsers;
  }

  async create(user: UserDto): Promise<void> {
    const { login, password, roles, description } = user;
    if (login === ADMIN_USER_NAME) {
      throw new ForbiddenException(`Login "${ADMIN_USER_NAME}" is reserved and cannot be created`);
    }

    const passwordHash = await this.cryptoService.hashPassword(password);

    await this.userRepository.create(login, { passwordHash, roles, description });
  }

  async update(updateUser: UpdateUserDto): Promise<void> {
    if (updateUser.login === undefined) {
      throw new BadRequestException(`Username not provided`);
    }

    if (updateUser.login === ADMIN_USER_NAME) {
      throw new ForbiddenException(`Login "${ADMIN_USER_NAME}" is reserved and cannot be created`);
    }

    // TODO: Validate data and improve public<->private dto conversion
    const data: Partial<IUserData> = {};
    if (updateUser.roles !== undefined) {
      data.roles = updateUser.roles;
    }
    if (updateUser.description !== undefined) {
      data.description = updateUser.description;
    }

    await this.userRepository.update(updateUser.login, data);
  }

  async remove(login: string): Promise<void> {
    if (login === ADMIN_USER_NAME) {
      throw new ForbiddenException(`Login "${ADMIN_USER_NAME}" is reserved and cannot be removed`);
    }

    await this.userRepository.remove(login);
  }

  // TODO: Move admin handling to own service?
  async createAdmin(): Promise<void> {
    const defaultPassword = await this.cryptoService.getDeviceDefaultPassword();
    const passwordHash = await this.cryptoService.hashPassword(defaultPassword);

    await this.userRepository.create(ADMIN_USER_NAME, {
      passwordHash,
      roles: ['admin'],
      description: 'The default admin user',
    });
  }
}
