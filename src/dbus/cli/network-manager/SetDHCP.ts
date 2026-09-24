import { CommandRunner, SubCommand } from 'nest-commander';
import { NetworkSettingsService } from '../../interfaces/network-manager/network-settings.service';
import { UpdatableSettings } from '../../interfaces/network-manager/types/ip.settings.types';

@SubCommand({
  name: 'set-dhcp',
  description: 'Set the connection of the provided network device to DHCP',
})
export class SetDHCP extends CommandRunner {
  constructor(private networkSettingsServer: NetworkSettingsService) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const [interfaceName] = passedParams;
    const setDhcp: UpdatableSettings = { ipv4: { method: 'auto' } };
    await this.networkSettingsServer.updateActiveConnectionOfDevice(interfaceName, setDhcp);
  }
}
