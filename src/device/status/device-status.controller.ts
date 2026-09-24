import { Controller, Get, Header } from '@nestjs/common';
import { DeviceStatusService } from './device-status.service';
import { RpiApiTags } from '../../open-api/constants';
import { ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import { AuthorizedRoles } from '../../authentication/authentication.guard';
import { DeviceMetricsService } from './device-metrics.service';

const OPEN_METRICS_CONTENT_TYPE = 'application/openmetrics-text; version=1.0.0; charset=utf-8';

/**
 * Get current status of this device
 * users with role 'read-only' may access all routes on this controller
 */
@AuthorizedRoles('read-only')
@RpiApiTags('Status', 'Device')
@ApiBearerAuth()
@Controller('/device')
export class DeviceStatusController {
  constructor(
    private readonly statusService: DeviceStatusService,
    private readonly metricsService: DeviceMetricsService,
  ) {}

  /**
   * Get details about the current status of the device
   */
  @Get('/status')
  getCurrentStatus() {
    return this.statusService.getCurrentStatus();
  }
  /**
   * Get metrics about the current status of the device in OpenMetrics format
   */
  // TODO: Prometheus needs a way to authenticate for metrics route, eg. API-Key in header or basic auth
  // @Public()
  @ApiProduces(OPEN_METRICS_CONTENT_TYPE)
  @Header('Content-Type', OPEN_METRICS_CONTENT_TYPE)
  @Get('/metrics')
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
