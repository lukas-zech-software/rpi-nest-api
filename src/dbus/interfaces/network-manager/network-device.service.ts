import { Injectable, Logger } from '@nestjs/common';
import { isMatch } from 'lodash';
import { getServicesWithMock, isDefined } from '../../../types/utils';
import { DBusProxy, SystemBusService } from '../../system-bus/system-bus.service';
import { networkDevicesMock } from './mock-data/network.device.mock';
import {
  ActiveConnectionProperties,
  DeviceProperties,
  DeviceType,
  DeviceWithChildren,
  Dhcp4ConfigProperties,
  Dhcp6ConfigProperties,
  EthernetDevice,
  EthernetDeviceProperties,
  Ip4ConfigProperties,
  Ip6ConfigProperties,
  SettingsConnectionProperties,
  WifiDeviceProperties,
} from './types';

/**
 * org.freedesktop.NetworkManager — Connection Manager.
 * // TODO: migratre to generated code
 * {@see https://networkmanager.dev/docs/api/latest/gdbus-org.freedesktop.NetworkManager.html}
 * */
interface ConnectionManager {
  GetAllDevices(): Promise<Array<string>>;

  GetDeviceByIpIface(interfaceName: string): Promise<string | undefined>;

  CheckpointCreate(devices: Array<string>, timeout: number, flags: number): Promise<string>;

  CheckpointDestroy(checkpoint: string): Promise<string>;
}

/**
 * org.freedesktop.NetworkManager — The D-Bus interface for network-manager
 * {@see https://networkmanager.dev/docs/api/latest/index.html}
 *
 * CLI examples
 * $ gdbus introspect --system --only-properties --recurse --dest org.freedesktop.NetworkManager --object-path /org/freedesktop/NetworkManager org.freedesktop.NetworkManager
 */
@Injectable()
export class NetworkDeviceService implements INetworkDeviceService {
  private readonly logger = new Logger(NetworkDeviceService.name);
  private readonly networkManagerProxy: DBusProxy;

  constructor(systemBusService: SystemBusService) {
    this.networkManagerProxy = systemBusService.createProxy(
      'org.freedesktop.NetworkManager',
      '/org/freedesktop/NetworkManager',
    );
  }

  /**
   * Returns paths for all devices
   */
  public async GetAllDevicePaths(): Promise<Array<string>> {
    const networkManagerMethods = await this.networkManagerProxy.getMethodInterface<ConnectionManager>(
      'org.freedesktop.NetworkManager',
    );
    return networkManagerMethods.GetAllDevices();
  }

  /**
   * Get network device at provided path with all child properties resolved
   */
  public async getDevice(
    devicePath: string,
    deviceFilters: Array<Partial<DeviceProperties>> = [],
  ): Promise<DeviceWithChildren | undefined> {
    this.logger.verbose(`Getting details for device at ${devicePath}.`);

    const deviceProperties = await this.getProperties<DeviceProperties>('Device', devicePath);
    const doesDeviceMatchFilter = deviceFilters.length === 0 || deviceFilters.some((x) => isMatch(deviceProperties, x));

    if (doesDeviceMatchFilter === false) {
      return;
    }

    return this.resolveDeviceProperties(deviceProperties, devicePath);
  }

  /**
   * Get all registered network devices
   * To get only specific devices, provide partial Device objects with the properties the devices must match
   */
  public async getAllDevices(deviceFilters?: Array<Partial<DeviceProperties>>): Promise<Array<DeviceWithChildren>> {
    const allDevicePaths = await this.GetAllDevicePaths();
    const allDevices = await Promise.all(allDevicePaths.map((x) => this.getDevice(x, deviceFilters)));
    return allDevices.filter(isDefined<DeviceWithChildren>);
  }

  private async resolveDeviceProperties(
    deviceProperties: DeviceProperties,
    devicePath: string,
  ): Promise<DeviceWithChildren> {
    // TODO: Reduce Details returned
    const baseDevice = {
      ...deviceProperties,
      ActiveConnection: await this.getProperties<ActiveConnectionProperties>(
        'Connection.Active',
        deviceProperties.ActiveConnection,
      ),
      Ip4Config: await this.getProperties<Ip4ConfigProperties>('IP4Config', deviceProperties.Ip4Config),
      Dhcp4Config: await this.getProperties<Dhcp4ConfigProperties>('DHCP4Config', deviceProperties.Dhcp4Config),
      Ip6Config: await this.getProperties<Ip6ConfigProperties>('IP6Config', deviceProperties.Ip6Config),
      Dhcp6Config: await this.getProperties<Dhcp6ConfigProperties>('DHCP6Config', deviceProperties.Dhcp6Config),
      AvailableConnections: await Promise.all(
        deviceProperties.AvailableConnections.map((x) =>
          this.getProperties<SettingsConnectionProperties>('Settings.Connection', x),
        ),
      ),
    };

    switch (baseDevice.DeviceType) {
      case DeviceType.ETHERNET:
        return {
          ...baseDevice,
          ...(await this.getProperties<EthernetDeviceProperties>('Device.Wired', devicePath)),
        } satisfies EthernetDevice;
      case DeviceType.WIFI:
        return {
          ...baseDevice,
          ...(await this.getProperties<WifiDeviceProperties>('Device.Wireless', devicePath)),
        } satisfies WifiDeviceProperties;
      default:
        return baseDevice;
    }
  }

  private async getProperties<T>(type: string, path: string): Promise<T> {
    if (path === '/') {
      return null as T;
    }

    const properties = await this.networkManagerProxy.getPropertiesInterface<T>(path);
    return properties.GetAllUnwrapped(`org.freedesktop.NetworkManager.${type}`);
  }
}

interface INetworkDeviceService {
  getDevice(
    devicePath: string,
    deviceFilters?: Array<Partial<DeviceProperties>>,
  ): Promise<DeviceWithChildren | undefined>;

  getAllDevices(deviceFilters?: Array<Partial<DeviceProperties>>): Promise<Array<DeviceWithChildren>>;
}

@Injectable()
export class NetworkDeviceServiceMock implements INetworkDeviceService {
  public async getAllDevices(): Promise<Array<DeviceWithChildren>> {
    return networkDevicesMock;
  }

  public async getDevice(): Promise<DeviceWithChildren | undefined> {
    return undefined;
  }
}

export const NetworkDeviceServiceProvider = getServicesWithMock<INetworkDeviceService>(
  NetworkDeviceService,
  NetworkDeviceServiceMock,
);
