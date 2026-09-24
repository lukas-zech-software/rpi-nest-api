/**
 * Device config parameter for the raspi-config tool
 */
export class DeviceConfigDto {
  /**
   * Identifier of the config
   */
  id: string;

  /**
   * Defines if config is currently enabled or not
   */
  isEnabled: boolean;

  /**
   * Defines if config is available on the device or not
   */
  isAvailable: boolean;

  /**
   * Current value of this config if applicable
   */
  value?: string;
}
