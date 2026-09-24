import { ApiProperty } from '@nestjs/swagger';
import { MetadataSettings } from '../../datastore/settings-repository/types';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Metadata for a device
 */
export class DeviceMetadataDto implements MetadataSettings {
  /**
   * This value is derived from the max length of a DNS hostname
   * {@see https://www.ietf.org/rfc/rfc1035.html#section-2.3.4}
   */
  @MaxLength(253)
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'rpi-nest 9000' })
  name?: string;

  @MaxLength(1000)
  @IsString()
  @IsOptional()
  @ApiProperty({
    example:
      'The rpi-nest is the most reliable computer ever made. No rpi-nest has ever made a mistake, or distorted information.',
  })
  description?: string;

  @MaxLength(500)
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Aboard the Discovery One' })
  location?: string;
}
