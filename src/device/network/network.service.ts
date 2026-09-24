import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { apiConfig } from '../../config/config';
import { NetworkDeviceService } from '../../dbus/interfaces/network-manager/network-device.service';
import { NetworkSettingsService } from '../../dbus/interfaces/network-manager/network-settings.service';
import { DeviceType } from '../../dbus/interfaces/network-manager/types';
import { IpSettings } from '../../dbus/interfaces/network-manager/types/ip.settings.types';
import { NetworkDeviceDto } from './dto/network-device.dto';
import {
  SimpleIpv4Settings,
  SimpleIPv4SettingsMethod,
  SimpleIpv6Settings,
  UpdateNetworkConfigConfirmDto,
  UpdateNetworkConfigDto,
} from './dto/update-network-config.dto';

@Injectable()
export class NetworkService {
  private readonly logger = new Logger(NetworkService.name);

  constructor(
    private networkManagerService: NetworkDeviceService,
    private networkSettingsService: NetworkSettingsService,
    @Inject(apiConfig.KEY) private config: ConfigType<typeof apiConfig>,
  ) {}

  async getNetworkInterfaces(): Promise<Array<NetworkDeviceDto>> {
    return this.networkManagerService.getAllDevices([
      { DeviceType: DeviceType.ETHERNET },
      { DeviceType: DeviceType.WIFI },
    ]);
  }

  async getActiveConnection(interfaceName: string): Promise<UpdateNetworkConfigDto> {
    const { ipv4, ipv6 } = await this.networkSettingsService.getActiveConnectionOfDevice(interfaceName);

    function toSimple(ip: IpSettings): SimpleIpv4Settings {
      const { method, gateway } = ip;
      const simpleIpSettings: SimpleIpv4Settings = {
        method: method as SimpleIPv4SettingsMethod,
        gateway,
      };

      const firstIp = ip['address-data'][0];
      if (firstIp !== undefined) {
        simpleIpSettings.address = firstIp.address;
        simpleIpSettings.prefix = firstIp.prefix;
      }
      const firstDns = ip['dns-data']?.[0];
      if (firstDns !== undefined) {
        simpleIpSettings.dns = firstDns;
      }

      return simpleIpSettings;
    }

    return {
      ipv4: toSimple(ipv4),
      ipv6: toSimple(ipv6),
    };
  }

  async update(interfaceName: string, config: Partial<UpdateNetworkConfigDto>): Promise<UpdateNetworkConfigConfirmDto> {
    function toInternal(ip: SimpleIpv6Settings | undefined): IpSettings | undefined {
      if (ip === undefined) {
        return undefined;
      }

      const { address, prefix, dns, gateway, method } = ip;
      const ipSettings: IpSettings = { 'address-data': [], gateway: gateway as string, method, 'dns-data': [] };

      if (address !== undefined && prefix !== undefined) {
        ipSettings['address-data'] = [{ address, prefix }];
      }

      if (dns !== undefined) {
        ipSettings['dns-data'] = [dns];
      }

      return ipSettings;
    }

    const checkpointId = await this.networkSettingsService.updateActiveConnectionOfDevice(interfaceName, {
      ipv4: toInternal(config.ipv4),
      ipv6: toInternal(config.ipv6),
    });

    const { protocol, hostname, port } = this.config;
    const localServerUrl = `${protocol}://${hostname}:${port}`;

    return {
      confirmationUrl: `${localServerUrl}/device/network/commit/${checkpointId}`,
    };
  }

  async commit(checkpointId: string): Promise<void> {
    try {
      await this.networkSettingsService.commitChanges(checkpointId);
    } catch (error) {
      this.logger.error('Error while confirming checkpoint', error);
      throw new BadRequestException('Invalid checkpoint');
    }
  }
}
