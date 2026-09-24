import { Modify } from '../../../../types/common';
import { DeviceProperties, EthernetDeviceProperties } from './device.types';
import { ActiveConnectionProperties, SettingsConnectionProperties } from './index';
import { Dhcp4ConfigProperties, Dhcp6ConfigProperties, Ip4ConfigProperties, Ip6ConfigProperties } from './ip.types';

/**
 * Types for objects with all paths to child objects resolved
 */

export type DeviceWithChildren = Modify<
  DeviceProperties,
  {
    ActiveConnection: ActiveConnectionProperties;
    Ip4Config: Ip4ConfigProperties;
    Dhcp4Config: Dhcp4ConfigProperties;
    Ip6Config: Ip6ConfigProperties;
    Dhcp6Config: Dhcp6ConfigProperties;
    AvailableConnections: Array<SettingsConnectionProperties>;
  }
>;

export type EthernetDevice = DeviceWithChildren & EthernetDeviceProperties;
