/**
 * Status information for a device
 */
export class DeviceStatusDto {
  /**
   * A unique identifier for the device.
   */
  serialNumber: string;
  /**
   * The uptime of the device in seconds.
   */
  uptime: number;
  /**
   * The full qualified hostname of the device
   */
  hostname: string;
  cpu: DeviceStatusCpuDto;
  fs: DeviceStatusFsDto;
}

/**
 * Status information for the CPU of a device.
 */
export class DeviceStatusCpuDto {
  /**
   * The temperature of the CPU in degree celsius
   */
  temperature: number;
  /**
   * The voltage of the CPU in Volt
   */
  voltage: number;
}

/**
 * Status information for the filesystem of a device.
 */
export class DeviceStatusFsDto {
  /**
   * The amount of used space in bytes
   */
  used: number;
  /**
   * The amount of available space in bytes
   */
  available: number;
}
