import {
  ActiveConnectionProperties,
  ConnectivityState,
  DeviceType,
  DeviceWithChildren,
  Dhcp4ConfigProperties,
  Dhcp6ConfigProperties,
  EthernetDevice,
  Ip4ConfigProperties,
  Ip6ConfigProperties,
  Metered,
  SettingsConnectionProperties,
} from '../../../dbus/interfaces/network-manager/types';

// TODO: Improve type for API specification
// TODO: 1. Types for Nested Objects
// TODO: 2. Example values
// TODO: 3. TBD: Transform to same types as update DTO?
export class NetworkDeviceDto implements DeviceWithChildren {
  public ActiveConnection: ActiveConnectionProperties;
  public Autoconnect: boolean;
  public AvailableConnections: Array<SettingsConnectionProperties>;
  public Capabilities: number;
  public DeviceType: DeviceType;
  public Dhcp4Config: Dhcp4ConfigProperties;
  public Dhcp6Config: Dhcp6ConfigProperties;
  public Driver: string;
  public DriverVersion: string;
  public FirmwareMissing: boolean;
  public FirmwareVersion: string;
  public HwAddress: string;
  public Interface: string;
  public InterfaceFlags: number;
  public Ip4Address: string | null;
  public Ip4Config: Ip4ConfigProperties;
  public Ip4Connectivity: ConnectivityState;
  public Ip6Config: Ip6ConfigProperties;
  public Ip6Connectivity: ConnectivityState;
  public IpInterface: string;
  public LldpNeighbors: any[];
  public Managed: boolean;
  public Metered: Metered;
  public Mtu: number;
  public NmPluginMissing: boolean;
  public Path: string;
  public PhysicalPortId: string;
  public Real: boolean;
  public State: number;
  public StateReason: number[];
  public Udi: string;
}

export class EthernetDeviceDto extends NetworkDeviceDto implements EthernetDevice {
  public Carrier: boolean;
  public PermHwAddress: string;
  public S390Subchannels: any[];
  public Speed: number;
}
