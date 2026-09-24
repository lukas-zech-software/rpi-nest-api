import { Body, Controller, Get, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RpiApiTags } from '../../open-api/constants';
import { DeviceConfigService } from './device-config.service';
import { UpdateDeviceConfigDto } from './dto/update-device-config.dto';

/**
 * Handles system configuration of the device
 */
@ApiBearerAuth()
@RpiApiTags('Device', 'Config')
@Controller('/device/config')
export class DeviceConfigController {
  constructor(private readonly deviceConfigService: DeviceConfigService) {}

  /**
   * Retrieves all current configuration values of the device
   */
  @Get()
  getAllConfigurations() {
    return this.deviceConfigService.getAllSupportedConfigurations();
  }

  /**
   * Retrieves details about a specific configuration of the device
   * @param id The id of the configuration
   */
  @ApiResponse({
    status: 400,
    description: 'Invalid configuration id provided',
  })
  @ApiParam({ name: 'id', example: 'ssh' })
  @Get(':id')
  async getConfiguration(@Param('id') id: string) {
    return this.deviceConfigService.getConfiguration(id);
  }

  /**
   * Set a configuration on the device
   * @param id The id of the configuration to set
   * @param updateDeviceConfigurationDto The value of the configuration
   */
  @ApiResponse({
    status: 400,
    description: 'Invalid configuration id provided',
  })
  @ApiParam({ name: 'id', example: 'ssh' })
  @HttpCode(204)
  @Patch(':id')
  setConfiguration(@Param('id') id: string, @Body() updateDeviceConfigurationDto: UpdateDeviceConfigDto) {
    return this.deviceConfigService.setConfiguration(id, updateDeviceConfigurationDto);
  }
}
