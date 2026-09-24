// noinspection JSUnusedGlobalSymbols

/**
 * Types are copied from "NetworkManager DBus" package
 * {@see https://gitlab.com/dropworks-oss/networkmanager-dbus/-/blob/master/src/dbus-types.ts}
 */

import { ChildObjectPath } from './common.types';

/**
 * Indicates the wireless mode of a wireless ddevice
 * @readonly
 * @enum {number}
 */
export enum WirelessMode {
  /** @member {number} */
  /** the device or access point mode is unknown */
  UNKNOWN = 0,
  /** @member {number} */
  /** for both devices and access point objects, indicates the object is part of an Ad-Hoc 802.11 network without a central coordinating access point. */
  ADHOC = 1,
  /** @member {number} */
  /** the device or access point is in infrastructure mode. For devices, this indicates the device is an 802.11 client/station. For access point objects, this indicates the object is an access point that provides connectivity to clients. */
  INFRA = 2,
  /** @member {number} */
  /** the device is an access point/hotspot. Not valid for access point objects; used only for hotspot mode on the local machine. */
  AP = 3,
  /** @member {number} */
  /** the device is a 802.11s mesh point. Since: 1.20. */
  MESH = 4,
}

/**
 * Properties for the wifi device. Inherits from generic device properties.
 * @see https://developer.gnome.org/NetworkManager/stable/gdbus-org.freedesktop.NetworkManager.Device.html
 * @see https://developer.gnome.org/NetworkManager/stable/gdbus-org.freedesktop.NetworkManager.Device.Wireless.html
 */
export interface WifiDeviceProperties {
  /** member {string} */
  /** The active hardware address of the device. */
  HwAddress: string;

  /** member {string} */
  /** The permanent hardware address of the device. */
  PermHwAddress: string;

  /** The operating mode of the wireless device. */
  Mode: WirelessMode;

  /** member {number} */
  /** The bit rate currently used by the wireless device, in kilobits/second (Kb/s). */
  Bitrate: number;

  /** List of object paths of access point visible to this wireless device. */
  AccessPoints: ChildObjectPath[];

  /** member {o} */
  /** Object path of the access point currently used by the wireless device. */
  ActiveAccessPoint: ChildObjectPath;

  /** member {number} */
  /** The capabilities of the wireless device. */
  WirelessCapabilities: number;

  /** member {number} */
  /** The timestamp (in CLOCK_BOOTTIME milliseconds) for the last finished network scan. A value of -1 means the device never scanned for access points. */
  LastScan: number;
}
/**
 * Wi-Fi Access Point
 *
 * @link https://developer.gnome.org/NetworkManager/stable/gdbus-org.freedesktop.NetworkManager.AccessPoint.html
 */
export interface AccessPointProperties {
  /** @member {number} */
  /**
   * Flags describing the capabilities of the access point.
   *
   * @see AccessPointFlags
   * */
  Flags: number;

  /** @member {number} */
  /**
   * Flags describing the access point's capabilities according to WPA (Wifi Protected Access).
   *
   * @see AccessPointSecurityFlags
   * */
  WpaFlags: number;

  /** @member {number} */
  /**
   * Flags describing the access point's capabilities according to the RSN (Robust Secure Network) protocol.
   *
   * @see AccessPointSecurityFlags
   *  */
  RsnFlags: number;

  //Returns: NM80211ApSecurityFlags
  /** @member {string} */
  /** The Service Set Identifier identifying the access point. */
  Ssid: string;

  /** @member {number} */
  /** The radio channel frequency in use by the access point, in MHz. */
  Frequency: number;

  /** @member {string} */
  /** The hardware address (BSSID) of the access point. */
  HwAddress: string;

  /** @member {number} */
  /** Describes the operating mode of the access point. */
  Mode: number;

  //Returns: NM80211Mode
  /** @member {number} */
  /** The maximum bitrate this access point is capable of, in kilobits/second (Kb/s). */
  MaxBitrate: number;

  /** @member {number} */
  /** The current signal quality of the access point, in percent. */
  Strength: number;

  /** @member {number} */
  /** The timestamp (in CLOCK_BOOTTIME seconds) for the last time the access point was found in scan results. A value of -1 means the access point has never been found in scan results. */
  LastSeen: number;
}
