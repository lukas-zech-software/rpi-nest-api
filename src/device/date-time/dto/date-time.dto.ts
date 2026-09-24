import { IntersectionType } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsString, ValidateIf } from 'class-validator';

/**
 * Date/Time settings DTO
 */
export class DateTimeSettingsDto {
  /**
   * The current time zone of the device
   */
  @IsString()
  timeZone: string;

  /**
   * The time as ISO-8601 string
   */
  @IsISO8601({ strict: true, strictSeparator: true })
  date: string;
}

/**
 * NTP settings DTO
 */
export class NtpSettingsDto {
  /**
   * IP address or DNS name of a custom NTP server
   * pool.ntp.org servers will be set as Fallback by default
   */
  @IsString()
  @ValidateIf((o) => o.isNtpEnabled)
  ntpServer?: string;

  /**
   * Enable or disable NTP time daemon
   */
  @IsBoolean()
  isNtpEnabled: boolean;
}

export class DateTimeInfoDto extends IntersectionType(DateTimeSettingsDto, NtpSettingsDto) {}
