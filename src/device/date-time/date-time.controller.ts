import { Body, Controller, Get, Patch } from '@nestjs/common';
import { AuthorizedRoles } from '../../authentication/authentication.guard';
import { RpiApiTags } from '../../open-api/constants';
import { ApiBadRequestResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DateTimeService } from './date-time.service';
import { DateTimeSettingsDto, DateTimeInfoDto, NtpSettingsDto } from './dto/date-time.dto';

@RpiApiTags('Device')
@ApiBearerAuth()
@Controller('/device/date-time')
export class DateTimeController {
  constructor(private dateTimeService: DateTimeService) {}

  /**
   * Get date and time settings of the system
   */
  @AuthorizedRoles('user')
  @Get()
  getDateTimeInfo(): Promise<DateTimeInfoDto> {
    return this.dateTimeService.getDateTime();
  }

  /**
   * Get all timezones available on the system
   */
  @AuthorizedRoles('user')
  @Get('/timezones')
  getAvailableTimezones(): Promise<Array<string>> {
    return this.dateTimeService.getAvailableTimezones();
  }

  /**
   * Updates time and date settings the device
   * If the system time is set with this method, the RTC will be updated as well.
   */
  @ApiBadRequestResponse({
    description: 'Cannot set system time while NTP synchronization is enabled. Disable NTP first.',
  })
  @Patch()
  updateDateTime(@Body() dateTimeSettings: DateTimeSettingsDto) {
    return this.dateTimeService.setDateTime(dateTimeSettings);
  }

  /**
   * Updates NTP settings of the device
   */
  @Patch('/ntp')
  updateNtpSettings(@Body() ntpSettings: NtpSettingsDto) {
    return this.dateTimeService.setNtp(ntpSettings);
  }
}
