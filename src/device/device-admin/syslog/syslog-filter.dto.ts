import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional, IsString } from 'class-validator';
import { SyslogFilter, SyslogFormat, SyslogFormats } from '../../../shell-command/command-services/journalctl.service';
import { SYSLOG_SERVICE_WHITELIST, SyslogServiceName } from './syslog.service';

/**
 * DTO for filter to retrieve syslog entries
 */
export class SyslogDto {
  /**
   * The name of the service to get the logs for
   * @example kernel
   */
  @ApiProperty({ example: 'kernel', type: 'string', enum: SYSLOG_SERVICE_WHITELIST, enumName: 'SyslogServiceName' })
  @IsIn(SYSLOG_SERVICE_WHITELIST)
  @IsString()
  name: SyslogServiceName;
}

/**
 * DTO for filter to retrieve syslog entries
 */
export class SyslogFilterDto implements SyslogFilter {
  /**
   * Format the log entries should be returned in
   */
  @ApiProperty({ example: 'short', type: 'string', enum: SyslogFormats })
  @IsIn(SyslogFormats)
  @IsString()
  @IsOptional()
  format?: SyslogFormat;

  /**
   * If provided, only logs that are newer than this date will be returned
   * Date must be valid ISO8601 string
   */
  @ApiProperty({ example: '2023-01-01T01:02:03.000Z' })
  @IsISO8601({ strict: true, strictSeparator: true })
  @IsOptional()
  since?: string;
}
