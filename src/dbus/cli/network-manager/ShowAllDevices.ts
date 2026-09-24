import { CommandRunner, SubCommand } from 'nest-commander';
import { inspect } from 'node:util';
import { NetworkDeviceService } from '../../interfaces/network-manager/network-device.service';
import { DeviceProperties } from '../../interfaces/network-manager/types';

@SubCommand({
  name: 'show-all-devices',
  description: 'Show properties of all devices on the org.freedesktop.NetworkManager interface',
})
export class ShowAllDevices extends CommandRunner {
  constructor(private networkManagerService: NetworkDeviceService) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const parsedParams = passedParams?.map((x) => JSON.parse(x) as Partial<DeviceProperties>);
    const allDevices = await this.networkManagerService.getAllDevices(parsedParams);
    allDevices.forEach((x) => console.log(inspect(x, { depth: null, colors: true })));
  }
}
