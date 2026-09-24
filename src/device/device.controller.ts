import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthorizedRoles } from '../authentication/authentication.guard';
import { RpiApiTags } from '../open-api/constants';
import { DeviceService } from './device.service';
import { DeviceMetadataDto } from './dto/device-metadata.dto';

/**
 * user - Role 'user' may access all Routes on this controller
 */
@AuthorizedRoles('user')
@RpiApiTags('Device')
@ApiBearerAuth()
@Controller('/device')
export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  /**
   * Retrieves metadata of the device
   * read-only - Role 'read-only' may access this route
   */
  @RpiApiTags('Metadata')
  @Get('/metadata')
  @AuthorizedRoles('read-only')
  getMetaData() {
    return this.deviceService.getMetaData();
  }

  /**
   * Updates metadata of the device
   */
  @RpiApiTags('Metadata')
  @Post('/metadata')
  setMetaData(@Body() metaData: DeviceMetadataDto) {
    return this.deviceService.setMetaData(metaData);
  }

  /**
   * Get list of packages installed on the system
   */
  @Get('/packages')
  getInstalledPackages() {
    return this.deviceService.getInstalledPackages();
  }
}
