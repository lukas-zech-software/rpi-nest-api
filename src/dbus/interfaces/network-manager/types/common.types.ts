// noinspection JSUnusedGlobalSymbols
/**
 * Types are copied from "NetworkManager DBus" package
 * {@see https://gitlab.com/dropworks-oss/networkmanager-dbus/-/blob/master/src/dbus-types.ts}
 */

/**
 * Indicates whether or not a connection is Metered
 * @readonly
 * @enum {number}
 */
export enum Metered {
  /** @member {number} */
  /** The metered status is unknown */
  UNKNOWN = 0,
  /** @member {number} */
  /** Metered, the value was explicitly configured */
  YES = 1,
  /** @member {number} */
  /** Not metered, the value was explicitly configured */
  NO = 2,
  /** @member {number} */
  /** Metered, the value was guessed */
  GUESS_YES = 3,
  /** @member {number} */
  /** Not metered, the value was guessed */
  GUESS_NO = 4,
}

/**
 * The state of a connection
 * Useful for graphical applications that want to handle specific connection scenarios
 * @readonly
 * @enum {number}
 */
export enum ConnectivityState {
  /** @member {number} */
  /** Network connectivity is unknown. This means the connectivity checks are disabled (e.g. on server installations) or has not run yet. The graphical shell should assume the Internet connection might be available and not present a captive portal window. */
  UNKNOWN = 0,
  /** @member {number} */
  /** The host is not connected to any network. There's no active connection that contains a default route to the internet and thus it makes no sense to even attempt a connectivity check. The graphical shell should use this state to indicate the network connection is unavailable. */
  NONE = 1,
  /** @member {number} */
  /** The Internet connection is hijacked by a captive portal gateway. The graphical shell may open a sandboxed web browser window (because the captive portals typically attempt a man-in-the-middle attacks against the https connections) for the purpose of authenticating to a gateway and retrigger the connectivity check with CheckConnectivity() when the browser window is dismissed. */
  PORTAL = 2,
  /** @member {number} */
  /** The host is connected to a network, does not appear to be able to reach the full Internet, but a captive portal has not been detected. */
  LIMITED = 3,
  /** @member {number} */
  /** The host is connected to a network, and appears to be able to reach the full Internet. */
  FULL = 4,
}

export type ChildObjectPath = string;
