import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { SettingsKey, SettingsRepository } from '../settings-repository/settings.repository';
import { DEFAULT_SETTINGS } from '../settings-repository/defaults';

@Injectable()
export class MaintenanceService {
  private logger = new Logger(MaintenanceService.name);

  constructor(private settingsRepository: SettingsRepository<SettingsKey>) {}

  public async resetAllSettingsToDefaults(ignoreExising = false): Promise<void> {
    const allSettingsKeys = this.getAllSettingsKeys();

    for (const settingsKey of allSettingsKeys) {
      const repository = this.settingsRepository.for(settingsKey);
      const isInitialized = await repository.isInitialized();

      if (isInitialized) {
        if (ignoreExising === false) {
          throw new ConflictException(`Settings for "${settingsKey}" are not empty.`);
        }

        this.logger.warn(`Overwriting existing settings for "${settingsKey}" with defaults.`);
      }

      await repository.resetDefaults();
    }

    this.logger.log(`All settings have been reset to defaults.`);
  }

  private getAllSettingsKeys(): Array<SettingsKey> {
    return Object.keys(DEFAULT_SETTINGS) as Array<SettingsKey>;
  }
}
