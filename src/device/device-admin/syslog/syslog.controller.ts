import { Controller, Get, Param, Query, StreamableFile } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { RpiApiTags } from '../../../open-api/constants';
import { SyslogDto, SyslogFilterDto } from './syslog-filter.dto';
import { SyslogService } from './syslog.service';

@RpiApiTags('Device')
@ApiBearerAuth()
@Controller('/device/syslog')
export class SyslogController {
  constructor(private syslogService: SyslogService) {}

  /**
   * Get the logs of the provided system service
   * Logs are read from appropriate source depending on the service
   * and are return as binary stream containing the raw, unparsed lines of the log
   * or streamed as JSON objects, one object per line if `?json=true`
   */
  @ApiOkResponse({
    content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } },
  })
  @ApiNotFoundResponse({ description: 'Thrown if provided service name is not known or not whitelisted' })
  @ApiBadRequestResponse({
    description: 'Thrown if log is not available in the requested format',
  })
  // TODO: HACK: Workaround to make the generated ApiFacade code in frontend handle blob responseType
  @ApiHeader({ name: 'Angular-Response-Type-Blob', schema: { default: '1' } })
  @Get('/:name')
  async getSyslog(@Param() { name }: SyslogDto, @Query() query?: SyslogFilterDto) {
    const logStream = await this.syslogService.getServiceLog(name, query);
    return new StreamableFile(logStream);
  }
}
