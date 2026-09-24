import { Injectable } from '@nestjs/common';
import {
  RpiConfigCommandService,
  RpiConfigurationId,
} from '../../shell-command/command-services/raspi-config-command.service';
import { DeviceConfigDto } from './dto/device-config.dto';
import { UpdateDeviceConfigDto } from './dto/update-device-config.dto';

@Injectable()
export class DeviceConfigService {
  constructor(private readonly rpiConfigCommandService: RpiConfigCommandService) {}

  async getAllSupportedConfigurations(): Promise<DeviceConfigDto[]> {
    const allSupportedConfigs = await this.rpiConfigCommandService.getSupportedConfigurations();
    const results = await this.rpiConfigCommandService.getConfigurationStates(allSupportedConfigs);

    return allSupportedConfigs.map((id, index) => ({
      id,
      ...results[index],
    }));
  }

  async getConfiguration(id: string): Promise<DeviceConfigDto> {
    const result = await this.rpiConfigCommandService.getConfigurationStatus(id);

    return {
      id,
      ...result,
    };
  }

  async setConfiguration(id: string, deviceConfigDto: UpdateDeviceConfigDto) {
    if (deviceConfigDto.isEnabled) {
      // TODO: Validate arguments?
      await this.rpiConfigCommandService.enableConfiguration(
        id as RpiConfigurationId,
        deviceConfigDto.value?.toString(),
      );
    } else {
      await this.rpiConfigCommandService.disableConfiguration(id as RpiConfigurationId);
    }
  }
}
