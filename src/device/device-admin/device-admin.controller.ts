import { Controller, Header, HttpCode, Post, Res, StreamableFile } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { RpiApiTags } from '../../open-api/constants';
import { DeviceAdminService } from './device-admin.service';
import { SosReportService } from './sos-report.service';

@RpiApiTags('Device')
@ApiBearerAuth()
@Controller('/device/admin')
export class DeviceAdminController {
  constructor(private deviceAdminService: DeviceAdminService, private sosReportService: SosReportService) {}

  /**
   * Reboot the device
   */
  @Post('/reboot')
  @HttpCode(204)
  reboot() {
    return this.deviceAdminService.reboot();
  }

  /**
   * Generate and download a sos-report
   */
  @Header('Content-Type', 'application/octet-stream')
  @Post('/generate-sos-report')
  @HttpCode(200)
  async generateSosReport(@Res({ passthrough: true }) res: Response) {
    const reportStream = await this.sosReportService.createReportStream();
    const reportFileName = `rpi-nest-sos-${Date.now()}.tar.gz`;

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${reportFileName}"`,
    });

    return new StreamableFile(reportStream);
  }
}
