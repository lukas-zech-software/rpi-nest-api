import { Module } from '@nestjs/common';
import { SyslogController } from './device-admin/syslog/syslog.controller';
import { SyslogService } from './device-admin/syslog/syslog.service';
import { DeviceConfigController } from './device-config/device-config.controller';
import { DeviceConfigService } from './device-config/device-config.service';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { DatastoreModule } from '../datastore/datastore.module';
import { DbusModule } from '../dbus/dbus.module';
import { DeviceAdminService } from './device-admin/device-admin.service';
import { DeviceAdminController } from './device-admin/device-admin.controller';
import { SosReportService } from './device-admin/sos-report.service';
import { DeviceMetricsService } from './status/device-metrics.service';
import { DeviceStatusService } from './status/device-status.service';
import { DeviceStatusController } from './status/device-status.controller';
import { OperatingSystemService } from './status/os/operating-system/operating-system.service';
import { NetworkController } from './network/network.controller';
import { NetworkService } from './network/network.service';
import { DateTimeController } from './date-time/date-time.controller';
import { DateTimeService } from './date-time/date-time.service';

@Module({
  imports: [DatastoreModule, DbusModule],
  controllers: [
    DeviceController,
    DeviceAdminController,
    SyslogController,
    DeviceConfigController,
    DeviceStatusController,
    NetworkController,
    DateTimeController,
  ],
  providers: [
    DeviceService,
    DeviceAdminService,
    DeviceConfigService,
    SosReportService,
    DeviceMetricsService,
    DeviceStatusService,
    OperatingSystemService,
    NetworkService,
    DateTimeService,
    SyslogService,
  ],
})
export class DeviceModule {}
