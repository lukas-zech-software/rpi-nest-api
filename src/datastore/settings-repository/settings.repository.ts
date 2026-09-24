import { Injectable, Logger } from '@nestjs/common';
import { LmbdStorageProvider } from '../storage/lmbd-storage.provider';
import type { Database } from 'lmdb';
import { Settings } from './types';
import { DEFAULT_SETTINGS } from './defaults';

export type SettingsKey = keyof Settings;
export type SettingsType<TKey extends SettingsKey> = Settings[TKey];

@Injectable()
export class SettingsRepository<TKey extends SettingsKey> {
  private logger = new Logger(SettingsRepository.name);
  private readonly settingsStore: Database<SettingsType<TKey>, TKey>;

  constructor(private storageService: LmbdStorageProvider<SettingsType<TKey>, TKey>) {
    this.settingsStore = storageService.getStore('settings', {
      // TODO: Use Versioning to rollback settings?
      cache: true,
    });
  }

  /**
   * Get this settings repository bound to a specific settings type
   * TODO: Refactor to key bound implementations that inherit from an AbstractBaseRepository
   */
  public for<T extends TKey>(key: T) {
    return {
      get: () => this.get(key),
      isInitialized: () => this.isInitialized(key),
      resetDefaults: () => this.resetDefaults(key),
      update: (data: Partial<SettingsType<T>>) => this.update(key, data),
    };
  }

  /**
   * Get the settings for provided key
   */
  private async get<T extends TKey>(key: T): Promise<SettingsType<T>> {
    const value = this.settingsStore.get(key) as SettingsType<T>;

    if (value === undefined) {
      const availableKeys = this.settingsStore.getKeys().asArray;
      this.logger.error(`Settings "${key}" not initialized.`);
      this.logger.debug(`Available keys:`, availableKeys);

      throw new Error(`Settings "${key}" not initialized.`);
    }

    this.logger.verbose(`Retrieved settings "${key}"`, value);

    return value;
  }

  /**
   * Check if the settings for provided key have already been initialized
   */
  private async isInitialized<T extends TKey>(key: T): Promise<boolean> {
    return this.settingsStore.doesExist(key);
  }

  /**
   * Reset the settings for provided key to default values
   */
  private async resetDefaults<T extends TKey>(key: T): Promise<void> {
    // TODO: Validate data
    // TODO: Update Timestamp
    const defaultValues = DEFAULT_SETTINGS[key];

    await this.settingsStore.put(key, defaultValues);
    this.logger.warn(`Resetting "${key}" to defaults.`);
  }

  /**
   * Update the settings for provided key with partial data
   * Provided data will be merged with data already present
   * @throws
   */
  private async update<T extends TKey>(key: T, data: Partial<SettingsType<T>>): Promise<void> {
    const currentValue = await this.get(key);
    const newValue = { ...currentValue, ...data };

    // TODO: Validate data
    // TODO: Update Timestamp
    await this.settingsStore.put(key, newValue);

    this.logger.verbose(`Updated settings "${key}"`, { data, currentValue, newValue });
  }

  /**
   * Set the provided data as the settings for provided key
   * Will overwrite any existing data
   */
  private async set<T extends TKey>(key: T, data: SettingsType<T>): Promise<void> {
    // TODO: Validate data
    // TODO: Update Timestamp
    await this.settingsStore.put(key, data);

    this.logger.verbose(`Set settings "${key}"`, { data });
  }
}
