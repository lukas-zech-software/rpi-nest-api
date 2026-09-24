import { Injectable } from '@nestjs/common';
import { SettingsRepository } from '../datastore/settings-repository/settings.repository';
import { DpkgCommandService } from '../shell-command/command-services/dpkg-command.service';
import { DeviceMetadataDto } from './dto/device-metadata.dto';
import { PackageInfoDto } from './dto/package-info.dto';

@Injectable()
export class DeviceService {
  constructor(
    private settingsRepository: SettingsRepository<'metadata'>,
    private dpkgCommandService: DpkgCommandService,
  ) {}

  async getMetaData(): Promise<DeviceMetadataDto> {
    return this.settingsRepository.for('metadata').get();
  }

  async setMetaData(metaData: DeviceMetadataDto): Promise<void> {
    await this.settingsRepository.for('metadata').update(metaData);
  }

  async getInstalledPackages(): Promise<Array<PackageInfoDto>> {
    return this.dpkgCommandService.getInstalledPackages();
  }
}
