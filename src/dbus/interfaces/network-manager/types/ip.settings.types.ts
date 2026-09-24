// noinspection JSUnusedGlobalSymbols

import { ArrayElement, Deletable, Modify } from '../../../../types/common';
import { BinaryNetworkAddressTuple, IpAddressBinary, IpAddressString, NetworkAddress, Route } from './ip.types';

/**
 * NOTE: The types for changing/updating the settings are arbitrarily different from
 * all the other well documented types used in the D-Bus API of network-manager
 * {@see https://networkmanager.dev/docs/api/latest/nm-settings-dbus.html}
 *
 * Watch out for subtle and hard to find differences in types across network-manager
 *
 * ```
 *   Note that there are different manifestations of these properties. We have them
 *   on the D-Bus API (`man nm-settings-dbus`), in keyfile format (`man nm-settings-keyfile`)
 *   in libnm's NMConnection and NMSetting API, and in nmcli (`man nm-settings-nmcli`).
 *   There are similarities between these, but also subtle differencs. For example,
 *   a property might not be shown in nmcli, or a property might be named different
 *   on D-Bus or keyfile. Also, the data types may differ due to the differences of the
 *   technology.
 *
 *   This list of properties is not directly the properties as they are in any of
 *   those manifestations. Instead, it's a general idea that this property exists in
 *   NetworkManager. Whether and how it is represented in nmcli or keyfile, may differ.
 *   The XML however aims to provide information for various backends.
 * ```
 * {@see https://gitlab.freedesktop.org/NetworkManager/NetworkManager/-/blob/main/src/libnm-core-impl/gen-metadata-nm-settings-libnm-core.xml.in}
 */

export type UpdatableSettings = Partial<Pick<ConnectionSettings<UpdateIpSettings>, 'ipv4' | 'ipv6'>>;

/**
 * Object returned by GetSettings()
 */
export interface ConnectionSettings<T extends UpdateIpSettings = IpSettings> {
  connection: ConnectionDetails;
  ipv4: Ipv4Settings<T>;
  ipv6: Ipv6Settings<T>;
}
export type Ipv4ConnectionSettings = IpSettings;

/**
 * Settings for connection
 * @readonly
 */
export interface ConnectionDetails {
  id: string;
  'interface-name': string;
  permissions: any[];
  timestamp: string;
  type: string;
  uuid: string;
}

export const IpSettingsMethods = ['disabled', 'auto', 'dhcp', 'manual', 'link-local'] as const;
export type IpSettingsMethod = ArrayElement<typeof IpSettingsMethods>;

/**
 * Settings common for IPv4 and IPv6 configuration of connection
 * @readonly
 */
export type IpSettings = {
  'address-data': NetworkAddress[];
  gateway: IpAddressString;
  method: IpSettingsMethod;
  'dns-data'?: IpAddressString[] | undefined;
  'dns-search'?: string[];
  'route-data'?: Route[];
  'ignore-auto-dns'?: boolean;
};

export type CommonIpSettings = Omit<IpSettings, keyof DhcpIpSettings>;
export type DhcpIpSettings = Modify<
  Partial<IpSettings>,
  {
    /**
     * 'auto'
     * IP configuration should be automatically determined via a method appropriate for the hardware interface, ie router advertisements, DHCP, or PPP or some other device-specific manner.
     *
     * 'dhcp' - only for IPv6
     * IPv6 configuration should be automatically determined via DHCPv6 only and router advertisements should be ignored.
     *
     */
    method: 'auto' | 'dhcp';
    'address-data'?: never;
    gateway?: never;
  }
>;
/**
 * To explicitly unset a setting without providing any new or empty value
 */
export type UnsetIpSettings = Deletable<Omit<IpSettings, 'method'>>;

export type UpdateIpSettings = DhcpIpSettings | IpSettings;

/**
 * These properties are all deprecated but are still returned by the NM D-Bus API
 * They should not be used and **must be removed** when updating any value
 * in their respective property
 */
export type DeprecatedIpSettings = {
  /** @deprecated use address-data field instead */
  addresses: BinaryNetworkAddressTuple[];
  /** @deprecated use dns-data field instead */
  dns: IpAddressBinary[];
  /** @deprecated use routes-data field instead */
  routes: BinaryNetworkAddressTuple[];
};

/**
 * Settings for IPv4 configuration of connection
 * @readonly
 */
export type Ipv4Settings<T extends UpdateIpSettings = IpSettings> = T;

/**
 * Settings for IPv4 configuration of connection
 * @readonly
 */
export type Ipv6Settings<T extends UpdateIpSettings = IpSettings> = T & {
  'addr-gen-mode'?: number;
};
