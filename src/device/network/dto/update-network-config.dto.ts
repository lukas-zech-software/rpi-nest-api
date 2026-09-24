import { Type } from 'class-transformer';
import { IsIn, IsIP, IsNumber, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { ArrayElement } from '../../../types/common';

export type SimpleIpSettings = {
  gateway?: string;
  address?: string;
  prefix?: number;
  dns?: string;
};

export type SimpleIpv4Settings = SimpleIpSettings & {
  method: SimpleIPv4SettingsMethod;
};
export type SimpleIpv6Settings = SimpleIpSettings & {
  method: SimpleIPv6SettingsMethod;
};

export const SimpleIPv4SettingsMethods = ['auto', 'manual'] as const;
export type SimpleIPv4SettingsMethod = ArrayElement<typeof SimpleIPv4SettingsMethods>;

export const SimpleIPv6SettingsMethods = ['auto', 'manual', 'dhcp'] as const;
export type SimpleIPv6SettingsMethod = ArrayElement<typeof SimpleIPv6SettingsMethods>;

export class UpdateIpv4SettingsDto implements SimpleIpv4Settings {
  @IsOptional()
  @IsIP(4)
  public address?: string;

  @IsOptional()
  @IsNumber()
  @Max(32)
  @Min(0)
  public prefix?: number;

  @IsOptional()
  @IsIP(4)
  public gateway?: string;

  @IsOptional()
  public dns?: string;

  /**
   * 'manual'
   * All necessary IP configuration (addresses, prefix, DNS, etc) is specified in the setting's properties.
   *
   * 'auto'
   * IP configuration should be automatically determined via a method appropriate for the hardware interface, ie router advertisements, DHCP, or PPP or some other device-specific manner.
   *
   */
  @IsIn(SimpleIPv4SettingsMethods)
  public method: SimpleIPv4SettingsMethod;
}

export class UpdateIpv6SettingsDto implements SimpleIpv6Settings {
  @IsOptional()
  @IsIP(6)
  public address?: string;

  @IsOptional()
  @IsNumber()
  @Max(128)
  @Min(1)
  public prefix?: number;

  @IsOptional()
  @IsIP(6)
  public gateway?: string;

  @IsOptional()
  public dns?: string;

  /**
   * 'manual'
   * All necessary IP configuration (addresses, prefix, DNS, etc) is specified in the setting's properties.
   *
   * 'auto'
   * IP configuration should be automatically determined via a method appropriate for the hardware interface, ie router advertisements, DHCP, or PPP or some other device-specific manner.
   *
   * 'dhcp' - only for IPv6
   * IPv6 configuration should be automatically determined via DHCPv6 only and router advertisements should be ignored.
   * @see https://networkmanager.dev/docs/libnm/latest/NMSettingIP6Config.
   *
   */
  @IsIn(SimpleIPv6SettingsMethods)
  public method: SimpleIPv6SettingsMethod;
}

export class UpdateNetworkConfigDto {
  @Type(() => UpdateIpv4SettingsDto)
  @ValidateNested()
  @IsOptional()
  public ipv4?: UpdateIpv4SettingsDto;

  @Type(() => UpdateIpv6SettingsDto)
  @ValidateNested()
  @IsOptional()
  public ipv6?: UpdateIpv6SettingsDto;
}

export class UpdateNetworkConfigConfirmDto {
  confirmationUrl: string;
}
