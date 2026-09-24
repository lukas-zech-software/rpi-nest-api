import { Injectable, Logger } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import * as fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import { join } from 'path';
import { ArrayElement } from '../../types/common';
import { getServicesWithMock } from '../../types/utils';
import { ChildProcessService } from '../child-process.service';

const JOURNAL_CTL_EXECUTABLE = '/usr/bin/journalctl';

enum JOURNAL_CTL_ARGUMENTS {
  unit = '--unit',
  output = '--output',
  since = '--since',
  kernel = '-k',
}

export const SyslogFormats = ['json', 'short'] as const;
export type SyslogFormat = string & ArrayElement<typeof SyslogFormats>;
export type SyslogFilter = {
  format?: SyslogFormat;
  since?: string;
};

interface IJournalctlService {
  getUnitLogs(unit: string, filter?: SyslogFilter): Promise<Array<string>>;

  getUnitLogStream(unit: string, filter?: SyslogFilter): Promise<Readable>;

  getKernelLogStream(filter?: SyslogFilter): Promise<Readable>;
}

@Injectable()
export class JournalctlService implements IJournalctlService {
  private readonly logger = new Logger(JournalctlService.name);

  constructor(private shellCommandService: ChildProcessService) {}

  public async getUnitLogs(unit: string): Promise<Array<string>> {
    const output = await this.shellCommandService.spawn(JOURNAL_CTL_EXECUTABLE, [JOURNAL_CTL_ARGUMENTS.unit, unit]);

    return output.split('\n');
  }

  public async getUnitLogStream(unit: string, filter?: SyslogFilter): Promise<Readable> {
    if (unit === 'kernel') {
      return this.getKernelLogStream(filter);
    }

    this.logger.verbose('Opening unit log stream ...');
    const journalCtlOutStream = await this.shellCommandService.spawnStreamable(
      JOURNAL_CTL_EXECUTABLE,
      this.getArgs(unit, filter),
    );
    this.logger.verbose('Unit log stream ready');

    return journalCtlOutStream;
  }

  public async getKernelLogStream(filter?: SyslogFilter): Promise<Readable> {
    this.logger.verbose('Opening kernel log stream ...');
    const journalCtlOutStream = await this.shellCommandService.spawnStreamable(
      JOURNAL_CTL_EXECUTABLE,
      this.getArgs('kernel', filter),
    );
    this.logger.verbose('Kernel log stream ready');

    return journalCtlOutStream;
  }

  private getArgs(unit: string, filter?: SyslogFilter) {
    let logTargetArgs = [JOURNAL_CTL_ARGUMENTS.unit, unit];

    if (unit === 'kernel') {
      logTargetArgs = [JOURNAL_CTL_ARGUMENTS.kernel];
    }

    let dateArgs: string[] = [];
    if (filter?.since !== undefined) {
      dateArgs = [JOURNAL_CTL_ARGUMENTS.since, new Date(filter.since).toISOString().slice(0, 10)];
    }

    return [JOURNAL_CTL_ARGUMENTS.output, filter?.format ?? 'short', ...logTargetArgs, ...dateArgs];
  }
}

@Injectable()
export class JournalctlServiceMock implements IJournalctlService {
  public async getKernelLogStream(): Promise<Readable> {
    const mockLogPath = join(process.cwd(), 'test/data', `kernel-mock-log.txt`);
    return createReadStream(mockLogPath);
  }

  public async getUnitLogStream(unit: string): Promise<Readable> {
    const mockFile = unit === 'kernel' ? `kernel-mock-log.txt` : `service-mock-log.txt`;
    const mockLogPath = join(process.cwd(), 'test/data', mockFile);
    return createReadStream(mockLogPath);
  }

  public async getUnitLogs(unit: string): Promise<Array<string>> {
    const mockFile = unit === 'kernel' ? `kernel-mock-log.txt` : `service-mock-log.txt`;
    const mockLogPath = join(process.cwd(), 'test/data', mockFile);
    const fileContent = await fs.readFile(mockLogPath, 'utf-8');
    return fileContent.split('\n');
  }
}

export const JournalCtlCommand = getServicesWithMock<IJournalctlService>(JournalctlService, JournalctlServiceMock);
