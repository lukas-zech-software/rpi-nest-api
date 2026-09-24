// noinspection JSUnusedGlobalSymbols

export interface Dhcp4ConfigProperties {
  Options: any[];
}

export interface Dhcp6ConfigProperties {
  Options: any[];
}

export type IpConfigProperties = {
  /**
   * Array of IP address data objects. All addresses will include "address" (an IP address string), and "prefix" (a uint).
   * Some addresses may include additional attributes.
   */
  AddressData: NetworkAddress[];
  Addresses: BinaryNetworkAddressTuple[];
  DnsOptions: any[];
  DnsPriority: number;
  Domains: any[];
  Gateway: string;
  RouteData: Route[];
  Routes: BinaryNetworkAddressTuple[];
  Searches: any[];
};

/**
 * https://networkmanager.dev/docs/api/latest/gdbus-org.freedesktop.NetworkManager.IP6Config.html
 */
export type Ip6ConfigProperties = IpConfigProperties & {
  /**
   * IPv6 currently still has nameservers in binary format
   * This should change soon
   * {@see https://gitlab.freedesktop.org/NetworkManager/NetworkManager/-/merge_requests/1434#note_1601315}
   */
  Nameservers: IpAddressBinary[];
};

/**
 * https://networkmanager.dev/docs/api/latest/gdbus-org.freedesktop.NetworkManager.IP4Config.html
 */
export type Ip4ConfigProperties = IpConfigProperties & {
  NameserverData: IpAddress[];
  Nameservers: IpAddressBinary[];
  WinsServerData: any[];
  WinsServers: any[];
};

/**
 * Array of tuples of IPv4/IPv6 address/prefix/gateway.
 * All 3 elements of each array are in network byte order. Essentially: [(addr, prefix, gateway), (addr, prefix, gateway), ...]
 * @deprecated: use AddressData and Gateway
 * @see https://networkmanager.dev/docs/api/latest/gdbus-org.freedesktop.NetworkManager.IP6Config.html#gdbus-property-org-freedesktop-NetworkManager-IP6Config.Addresses
 * @see https://networkmanager.dev/docs/api/latest/gdbus-org.freedesktop.NetworkManager.IP4Config.html#gdbus-property-org-freedesktop-NetworkManager-IP4Config.Addresses
 */
export type BinaryNetworkAddressTuple = [IpAddressBinary, number, IpAddressBinary];
/**
 * Binary IP Address encoded in a uint32 value
 * @deprecated: use String AddressData and Gateway
 */
export type IpAddressBinary = Buffer;
/**
 * IP Address as octet string e.g. 192.168.0.1
 */
export type IpAddressString = string;

export type IpAddress = {
  address: IpAddressString;
};

export type NetworkAddress = IpAddress & {
  /**
   * Subnet prefix
   */
  prefix: number;
};

export type Route = {
  dest: string;
  metric: number;
  'next-hop'?: string;
  prefix: number;
};
