import { Injectable } from '@nestjs/common';
import { DfCommandService } from '../../shell-command/command-services/df-command.service';
import { RasPiSerialCommandService } from '../../shell-command/command-services/pi-serial-command.service';
import { UpTimeCommandService } from '../../shell-command/command-services/uptime-command.service';
import { VcGenCmdCommandService } from '../../shell-command/command-services/vcgencmd-command.service';
import { DeviceStatusDto } from './dto/device-status.dto';
import { OperatingSystemService } from './os/operating-system/operating-system.service';

@Injectable()
export class DeviceStatusService {
  constructor(
    private operatingSystemService: OperatingSystemService,
    private rasPiSerialCommandService: RasPiSerialCommandService,
    private vcGenCmdCommandService: VcGenCmdCommandService,
    private upTimeCommandService: UpTimeCommandService,
    private dfCommandService: DfCommandService,
  ) {}

  async getCurrentStatus(): Promise<DeviceStatusDto> {
    const [serialNumber, uptime, hostname, fs, temperature, voltage] = await Promise.all([
      this.rasPiSerialCommandService.getSerial(),
      this.upTimeCommandService.getUpTime(),
      this.operatingSystemService.getHostname(),
      this.dfCommandService.getDiskSpaceInformation(),
      this.vcGenCmdCommandService.getTemperature(),
      this.vcGenCmdCommandService.getCoreVoltage(),
    ]);
    return {
      serialNumber,
      uptime,
      hostname,
      cpu: {
        temperature,
        voltage,
      },
      fs,
    };
  }
}
