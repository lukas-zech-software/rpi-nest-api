import { Injectable, Logger } from '@nestjs/common';
import { getServicesWithMock } from '../../types/utils';
import { ChildProcessService } from '../child-process.service';

const TEST_DEFAULT_UPTIME = 1337 * 42;

const UPTIME_EXECUTABLE = '/usr/bin/uptime';

enum UPTIME_ARGUMENTS {
  since = '-s',
}

interface IUpTimeCommandService {
  getUpTime(): Promise<number>;
}

@Injectable()
export class UpTimeCommandService implements IUpTimeCommandService {
  private readonly logger = new Logger(UpTimeCommandService.name);
  constructor(private shellCommandService: ChildProcessService) {}

  /**
   * Get seconds since the system is up
   */
  public async getUpTime(): Promise<number> {
    const output = await this.shellCommandService.spawn(UPTIME_EXECUTABLE, [UPTIME_ARGUMENTS.since]);
    try {
      return (Date.now() - new Date(output).getTime()) / 1000;
    } catch (error) {
      this.logger.error('uptime returned unparsable result', { output });
      throw new Error('uptime returned unparsable result');
    }
  }
}

@Injectable()
export class UpTimeCommandServiceMock implements IUpTimeCommandService {
  async getUpTime(): Promise<number> {
    return TEST_DEFAULT_UPTIME;
  }
}

export const UpTimeCommand = getServicesWithMock<IUpTimeCommandService>(UpTimeCommandService, UpTimeCommandServiceMock);
