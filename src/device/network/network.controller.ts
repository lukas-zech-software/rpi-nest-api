import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthorizedRoles } from '../../authentication/authentication.guard';
import { RpiApiTags } from '../../open-api/constants';
import { NetworkDeviceDto } from './dto/network-device.dto';
import { UpdateNetworkConfigConfirmDto, UpdateNetworkConfigDto } from './dto/update-network-config.dto';
import { NetworkService } from './network.service';

@RpiApiTags('Device', 'Network')
@ApiBearerAuth()
@Controller('/device/network')
export class NetworkController {
  constructor(private networkService: NetworkService) {}

  /**
   * Get all network interfaces and their configuration details
   */
  @AuthorizedRoles('user')
  @Get('/interfaces')
  getNetworkInterfaces(): Promise<Array<NetworkDeviceDto>> {
    // TODO: Implement passing filters for returned devices
    return this.networkService.getNetworkInterfaces();
  }

  /**
   */
  @AuthorizedRoles('user')
  @Get('/interface/:interfaceName')
  getActiveConnection(@Param('interfaceName') interfaceName: string): Promise<UpdateNetworkConfigDto> {
    return this.networkService.getActiveConnection(interfaceName);
  }

  /**
   * Updates configuration of provided network device
   *
   * Note: The new settings must be committed by sending a POST request to the /commit route within 30 seconds!
   * Else/wise a misconfiguration is assumed and the settings will be reverted
   */
  @ApiParam({ name: 'interfaceName', example: 'eth0' })
  @Patch('/interface/:interfaceName')
  updateNetworkInterface(
    @Param('interfaceName') interfaceName: string,
    @Body() updatedConfig: UpdateNetworkConfigDto,
  ): Promise<UpdateNetworkConfigConfirmDto> {
    return this.networkService.update(interfaceName, updatedConfig);
  }

  /**
   * Commit the network changes made before
   * The new network configuration of the device works if you can reach this endpoint
   *
   * Note: The new settings must be committed by sending a POST request to this route within 30 seconds!
   * Else/wise a misconfiguration is assumed and the settings will be reverted
   */
  @ApiParam({ name: 'checkpointId', example: '42' })
  @Post('/commit/:checkpointId')
  commitChanges(@Param('checkpointId') checkpointId: string) {
    return this.networkService.commit(checkpointId);
  }
}
