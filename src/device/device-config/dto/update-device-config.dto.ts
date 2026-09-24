import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateDeviceConfigDto {
  /**
   * Defines if config is currently enabled or not
   */
  @IsBoolean()
  isEnabled: boolean;

  /**
   * Value to set for this config if applicable
   */
  @IsOptional()
  @IsString()
  value?: string;
}
