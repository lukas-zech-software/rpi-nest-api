import { Injectable, Logger } from '@nestjs/common';
import type { Database } from 'lmdb';
import { isDefined } from '../../types/utils';
import { LmbdStorageProvider } from '../storage/lmbd-storage.provider';

/**
 * The UserLogin is the unique key under which the user data is stored in the database
 * It cannot be changed
 */
export type UserLogin = string;

export type IUserData = {
  login: string;
  passwordHash: string;
  description?: string;
  // TODO: How to share type between datastore and auth module?
  roles: Array<'admin' | 'user' | 'read-only'>;
  created: number;
  modified: number;
};
export type CreateUserData = Omit<IUserData, 'login' | 'created' | 'modified'>;
export type UpdateUserData = Partial<CreateUserData>;

@Injectable()
export class UserRepository {
  private readonly userStore: Database<IUserData, UserLogin>;
  private readonly logger = new Logger(UserRepository.name);

  constructor(private storageService: LmbdStorageProvider<IUserData, UserLogin>) {
    this.userStore = storageService.getStore('users', {
      // TODO: no need to cache users? for refresh tokens?
      cache: false,
      //use shared structures as this db contains many objects of the same type
      sharedStructuresKey: Symbol.for('users-structures'),
    });
    const availableKeys = this.userStore.getKeys().asArray;
    this.logger.debug(`Available keys:`, availableKeys);
  }

  /**
   * Get the user with the provided login
   */
  async getByLogin(userLogin: string): Promise<IUserData | undefined> {
    const user = this.userStore.get(userLogin);

    if (user === undefined) {
      this.logger.warn(`Could not find user "${userLogin}"`);
    }

    return user;
  }

  /**
   * Get all users stored
   */
  async getAll(): Promise<IUserData[]> {
    // Get all keys and filter out Symbol(users-structures)
    const allUserKeys = this.userStore.getKeys().asArray.filter((x: unknown) => typeof x === 'string');
    const allUsers = await this.userStore.getMany(allUserKeys);

    return allUsers.filter(isDefined<IUserData>);
  }

  /**
   * Create a new user with the provided login and data
   */
  async create(userLogin: string, data: CreateUserData): Promise<void> {
    if (this.userStore.doesExist(userLogin)) {
      this.logger.error(`User "${userLogin}" already exists`);
      throw new Error('User already exists');
    }

    // TODO: Validate data
    // TODO: Created Timestamp
    const created = Date.now();
    await this.userStore.put(userLogin, { ...data, login: userLogin, created, modified: created });

    this.logger.verbose(`Created new user "${userLogin}"`);
  }

  /**
   * Update the user with the provided login and merge data with existing data
   */
  async update(userLogin: string, data: UpdateUserData): Promise<void> {
    // TODO: Validate data
    // TODO: Update Timestamp

    const user = await this.getByLogin(userLogin);
    if (user === undefined) {
      this.logger.error(`Could not update unknown user "${userLogin}"`);
      throw new Error('Could not update unknown user');
    }

    const modified = Date.now();
    await this.userStore.put(userLogin, { ...user, ...data, modified });

    this.logger.verbose(`Updated user ${userLogin}`);
  }

  /**
   * Delete the user with the provided login
   */
  async remove(userLogin: string) {
    if (this.userStore.doesExist(userLogin) === false) {
      this.logger.error(`Could not remove unknown user "${userLogin}"`);
      throw new Error('Could not remove unknown user');
    }

    await this.userStore.remove(userLogin);
    this.logger.verbose(`Removed user "${userLogin}"`);
  }
}
