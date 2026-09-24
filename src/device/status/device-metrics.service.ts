import { Injectable } from '@nestjs/common';
import * as Prometheus from 'prom-client';
import { Gauge, register } from 'prom-client';
import { DeviceStatusService } from './device-status.service';

@Injectable()
export class DeviceMetricsService {
  private cpuTemperatureGauge: Gauge<string>;
  private cpuVoltageGauge: Gauge<string>;
  private fsAvailableGauge: Gauge<string>;
  private fsUsedGauge: Gauge<string>;
  private upTimeGauge: Gauge<string>;

  constructor(private statusService: DeviceStatusService) {
    // TODO: Fix typings once prom-client v15 is released
    register.setContentType((Prometheus.Registry as any).OPENMETRICS_CONTENT_TYPE);

    this.cpuTemperatureGauge = new Gauge({ name: 'cpu_temperature', help: 'CPU core temperature in degrees Celsius' });
    this.cpuVoltageGauge = new Gauge({ name: 'cpu_voltage', help: 'CPU core voltage in V' });
    this.fsAvailableGauge = new Gauge({ name: 'fs_available', help: 'Available disk space in bytes' });
    this.fsUsedGauge = new Gauge({ name: 'fs_used', help: 'User disk space in bytes' });
    this.upTimeGauge = new Gauge({ name: 'dev_uptime', help: 'Uptime of the device in seconds' });
  }

  // TODO: Update metrics on interval or only on request?
  async updateMetrics(): Promise<void> {
    const status = await this.statusService.getCurrentStatus();
    register.setDefaultLabels({ hostname: status.hostname, serialNumber: status.serialNumber });
    this.cpuTemperatureGauge.set(status.cpu.temperature);
    this.cpuVoltageGauge.set(status.cpu.voltage);
    this.fsAvailableGauge.set(status.fs.available);
    this.fsUsedGauge.set(status.fs.used);
    this.upTimeGauge.set(status.uptime);
  }

  async getMetrics(): Promise<string> {
    await this.updateMetrics();
    return register.metrics();
  }
}
