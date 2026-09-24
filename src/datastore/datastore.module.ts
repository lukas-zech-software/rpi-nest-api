import { Module } from '@nestjs/common';
import { LmbdStorageProvider } from './storage/lmbd-storage.provider';
import { UserRepository } from './user-repository/user.repository';
import { SettingsRepository } from './settings-repository/settings.repository';
import { MaintenanceService } from './maintenance/maintenance.service';
import { AllDataStoreCommands } from './cli/datastore.command';

@Module({
  providers: [LmbdStorageProvider, UserRepository, SettingsRepository, MaintenanceService, ...AllDataStoreCommands],
  exports: [UserRepository, SettingsRepository],
})
export class DatastoreModule {}
