import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { join } from 'path';
import { apiConfig } from '../../../config/config';
import { JournalctlService, SyslogFilter } from '../../../shell-command/command-services/journalctl.service';
import { ArrayElement } from '../../../types/common';

// TODO: Check if this can be used as API
// https://www.freedesktop.org/software/systemd/man/latest/systemd-journal-gatewayd.html#

type JournalLogOptions = {
  isJournal?: true;
  unit: SyslogServiceName;
};

type FileLogOptions = {
  isJournal: false;
  path: string;
};
type LogOptions = JournalLogOptions | FileLogOptions;

/**
 * List of service names whose logs can be requested by a client
 */
export const SYSLOG_SERVICE_WHITELIST = ['noderedrpinodes-server', 'kernel', 'dpkg', 'ssh'] as const;
export type SyslogServiceName = ArrayElement<typeof SYSLOG_SERVICE_WHITELIST>;

/**
 * Config for all service logs
 */
const SYSLOG_SERVICES: Map<SyslogServiceName, LogOptions> = new Map([
  ['dpkg', { isJournal: false, path: '/var/log/dpkg.log' }],
  ['noderedrpinodes-server', { isJournal: false, path: '/var/log/rpi-nest-server.log' }],
  ['ssh', { isJournal: true, unit: 'ssh' }],
  ['kernel', { isJournal: true, unit: 'kernel' }],
]);

@Injectable()
export class SyslogService {
  private readonly logger = new Logger(SyslogService.name);

  constructor(
    private journalctlService: JournalctlService,
    @Inject(apiConfig.KEY) private config: ConfigType<typeof apiConfig>,
  ) {}

  // TODO: Implement date filter
  public async getServiceLog(serviceName: SyslogServiceName, filter?: SyslogFilter): Promise<Readable> {
    const options = SYSLOG_SERVICES.get(serviceName);
    if (options === undefined) {
      this.logger.error(`Received invalid service name: ${serviceName}`);
      throw new NotFoundException('Invalid service name provided');
    }

    this.logger.verbose(`Found options for ${serviceName}`, options);

    if (options.isJournal === false) {
      if (filter?.format !== undefined && filter.format !== 'short') {
        throw new BadRequestException('FileLogs are only available in default, unparsed text format');
      }
      return this.streamFile(options);
    }

    return this.streamJournal(options, filter);
  }

  private async streamJournal(options: JournalLogOptions, filter?: SyslogFilter): Promise<Readable> {
    return this.journalctlService.getUnitLogStream(options.unit, filter);
  }

  private async streamFile(options: FileLogOptions): Promise<Readable> {
    // TODO: Refactor: Move to own FS service and mock that
    if (this.config.isProduction === false) {
      const mockLogPath = join(process.cwd(), 'test/data', `service-mock-log.txt`);
      return createReadStream(mockLogPath);
    }
    return createReadStream(options.path);
  }
}
