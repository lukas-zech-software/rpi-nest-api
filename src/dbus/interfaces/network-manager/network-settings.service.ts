import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { getServicesWithMock } from '../../../types/utils';
import { DBusProxy, SystemBusService } from '../../system-bus/system-bus.service';
import { VariantParentObject } from '../../types';
import { unwrapVariantObject } from '../../utils';
import { IpSettingsVariantAdapter } from './connection-settings.adapter';
import { SettingsConnectionProxy } from './settings-connection.proxy';
import { ActiveConnectionProperties, DeviceProperties } from './types';
import { ConnectionSettings, UpdatableSettings } from './types/ip.settings.types';

/**
 * org.freedesktop.NetworkManager — Connection Manager.
 * // TODO: migrate to generated code
 * {@see https://networkmanager.dev/docs/api/latest/gdbus-org.freedesktop.NetworkManager.html}
 * */
interface ConnectionManager {
  GetAllDevices(): Promise<Array<string>>;

  GetDeviceByIpIface(interfaceName: string): Promise<string | undefined>;

  CheckpointCreate(devices: Array<string>, timeout: number, flags: number): Promise<string>;

  CheckpointDestroy(checkpoint: string): Promise<string>;
}

interface Device {
  Reapply(
    connection: VariantParentObject<ConnectionSettings> | null,
    version: number | 0,
    flags: number,
  ): Promise<void>;
}

@Injectable()
export class NetworkSettingsService implements INetworkSettingsService {
  private readonly logger = new Logger(NetworkSettingsService.name);
  private readonly networkManagerProxy: DBusProxy;

  constructor(private readonly systemBusService: SystemBusService) {
    /**
     * org.freedesktop.NetworkManager — The D-Bus interface for network-manager
     * {@see https://networkmanager.dev/docs/api/latest/index.html}
     * // TODO: migratre to generated code
     * CLI examples
     * $ gdbus introspect --system --only-properties --recurse --dest org.freedesktop.NetworkManager --object-path /org/freedesktop/NetworkManager org.freedesktop.NetworkManager
     */
    this.networkManagerProxy = systemBusService.createProxy(
      'org.freedesktop.NetworkManager',
      '/org/freedesktop/NetworkManager',
    );
  }

  /**
   * Commits the last changes made to the network settings by deleting the checkpoint
   * before it rolls back
   */
  public async commitChanges(checkpointId: string): Promise<void> {
    const checkpointPath = `/org/freedesktop/NetworkManager/Checkpoint/${checkpointId}`;
    this.logger.log(`Committing changes to network settings for checkpoint: ${checkpointPath}`);

    const networkManagerMethods = await this.networkManagerProxy.getMethodInterface<ConnectionManager>(
      'org.freedesktop.NetworkManager',
    );
    await networkManagerMethods.CheckpointDestroy(checkpointPath);
  }

  public async getActiveConnectionOfDevice(deviceName: string): Promise<ConnectionSettings> {
    const networkManagerMethods = await this.networkManagerProxy.getMethodInterface<ConnectionManager>(
      'org.freedesktop.NetworkManager',
    );
    const devicePath = await networkManagerMethods.GetDeviceByIpIface(deviceName);

    if (devicePath === undefined || devicePath === '/') {
      throw new Error(`No device found with name '${deviceName}'`);
    }

    const deviceProperties = await this.getProperties<DeviceProperties>('Device', devicePath);

    if (deviceProperties.ActiveConnection === '/') {
      this.logger.error(`Cannot get connection settings: Device is not active`, deviceProperties);
      throw new BadRequestException(`Cannot get connection settings: Device is not active`);
    }

    const activeConnectionProperties = await this.getProperties<ActiveConnectionProperties>(
      'Connection.Active',
      deviceProperties.ActiveConnection,
    );

    const connectionSettingsInterface = await SettingsConnectionProxy.Connect(
      this.systemBusService.systemBus,
      activeConnectionProperties.Connection,
    );
    const currentSettings = await connectionSettingsInterface.GetSettings();

    return unwrapVariantObject(currentSettings);
  }

  /**
   * Update settings for the active connection of the provided device
   * Creates a checkpoint before applying the changes
   * The changes must be confirmed within 30 seconds or they will be rolled back
   *
   * TODO: Refactor with generated interfaces
   */
  public async updateActiveConnectionOfDevice(deviceName: string, updateSettings: UpdatableSettings): Promise<string> {
    this.logger.log('Updating connection settings for device', deviceName);

    const networkManagerMethods = await this.networkManagerProxy.getMethodInterface<ConnectionManager>(
      'org.freedesktop.NetworkManager',
    );
    const devicePath = await networkManagerMethods.GetDeviceByIpIface(deviceName);

    if (devicePath === undefined || devicePath === '/') {
      throw new Error(`No device found with name '${deviceName}'`);
    }

    const deviceProperties = await this.getProperties<DeviceProperties>('Device', devicePath);
    const activeConnectionProperties = await this.getProperties<ActiveConnectionProperties>(
      'Connection.Active',
      deviceProperties.ActiveConnection,
    );

    const deviceMethods = await this.networkManagerProxy.getMethodInterface<Device>(
      'org.freedesktop.NetworkManager.Device',
      devicePath,
    );

    const settingsConnectionProxy = await SettingsConnectionProxy.Connect(
      this.systemBusService.systemBus,
      activeConnectionProperties.Connection,
    );
    const currentSettings = await settingsConnectionProxy.GetSettings();

    currentSettings.ipv4 = new IpSettingsVariantAdapter(currentSettings.ipv4).applyChanges(updateSettings.ipv4);
    currentSettings.ipv6 = new IpSettingsVariantAdapter(currentSettings.ipv6).applyChanges(updateSettings.ipv6);

    // Create checkpoint before saving the new settings
    const checkpointPath = await networkManagerMethods.CheckpointCreate([devicePath], 30, 0);
    const checkpointId = checkpointPath.split('/').at(-1);
    if (checkpointId === undefined) {
      this.logger.error(`Invalid checkpoint path: ${checkpointPath}`);
      throw new Error('Error while creating checkpoint for connection settings');
    }

    this.logger.log('Created checkpoint ', { device: deviceName, checkpointPath, checkpointId });

    try {
      // Update the settings saves it to disk, but they are not in effect yet
      await settingsConnectionProxy.Update(currentSettings);

      const currentlyAppliedConnection = await deviceMethods.GetAppliedConnection(0);
      const currentVersion = currentlyAppliedConnection[1];

      // Apply new settings after response was sent to client
      setImmediate(async () => {
        try {
          // Apply updated settings to device to put the changes in effect
          this.logger.warn('Applying new settings');
          await deviceMethods.Reapply(currentSettings, currentVersion, 0);
        } catch (error) {
          this.logger.error('Error while applying new settings', error);
        }
      });

      return checkpointId;
    } catch (error) {
      const { message, stack } = error;
      this.logger.error('Error while updating connection settings', { error, message, stack });
      throw new InternalServerErrorException('Error while updating connection settings');
    }
  }

  private async getProperties<T>(type: string, path: string): Promise<T> {
    const properties = await this.networkManagerProxy.getPropertiesInterface<T>(path);
    return properties.GetAllUnwrapped(`org.freedesktop.NetworkManager.${type}`);
  }
}

interface INetworkSettingsService {
  commitChanges(checkpointId: string): Promise<void>;

  updateActiveConnectionOfDevice(deviceName: string, updateSettings: UpdatableSettings): Promise<string>;

  getActiveConnectionOfDevice(deviceName: string): Promise<ConnectionSettings>;
}

@Injectable()
export class NetworkSettingsServiceMock implements INetworkSettingsService {
  public async commitChanges(): Promise<void> {
    return;
  }

  public async getActiveConnectionOfDevice(): Promise<ConnectionSettings> {
    return {
      connection: {
        id: 'my-static',
        'interface-name': 'eth0',
        permissions: [],
        timestamp: '1698117566',
        type: '802-3-ethernet',
        uuid: '32f7f44b-57bc-4247-8a90-1e34992ed51d',
      },
      ipv4: {
        'address-data': [
          {
            address: '192.168.0.42',
            prefix: 12,
          },
        ],
        'dns-data': ['8.8.8.8', '4.4.4.4'],
        //'dns-search': [],
        gateway: '192.168.0.1',
        method: 'auto',
        //'route-data': [],
      },
      ipv6: {
        'address-data': [
          {
            address: '2001:a61:60a6:db01:d1a8:5a9f:9869:638f',
            prefix: 64,
          },
        ],
        gateway: '2001:a61:6045:9101:3e37:12ff:fe0d:2796',
        method: 'auto',
        'dns-data': [],

        // 'dns-search': [],
        // 'route-data': [],
      },
    };
  }

  public async updateActiveConnectionOfDevice(): Promise<string> {
    return 'mock-checkpoint-id';
  }
}

export const NetworkSettingsServiceProvider = getServicesWithMock<INetworkSettingsService>(
  NetworkSettingsService,
  NetworkSettingsServiceMock,
);
