import { Injectable, Logger } from '@nestjs/common';
import { getServicesWithMock } from '../../types/utils';
import { ChildProcessService } from '../child-process.service';

const DF_EXECUTABLE = '/usr/bin/df';

export type DiskSpaceInformation = {
  available: number;
  used: number;
};

interface IDfCommandService {
  getDiskSpaceInformation(): Promise<DiskSpaceInformation>;
}

/**
 * TODO: Replace with fs.statfs() in Node.js v18
 */
@Injectable()
export class DfCommandService implements DfCommandService {
  private readonly logger = new Logger(DfCommandService.name);

  constructor(private shellCommandService: ChildProcessService) {}

  /**
   * Get used and available disk space of the root filesystem
   */
  public async getDiskSpaceInformation(): Promise<DiskSpaceInformation> {
    const result = await this.shellCommandService.spawn(DF_EXECUTABLE, ['/', '--output=used,avail']);
    // First line contains header and seconds line the values
    const [, values = ''] = result.split('\n');
    const [used, available] = values.split(' ').map((x) => parseInt(x, 10));

    if (!Number.isInteger(available) || !Number.isInteger(used)) {
      this.logger.error('df returned unparsable result', { result });
      throw new Error('df returned unparsable result');
    }

    return {
      available,
      used,
    };
  }
}

@Injectable()
export class DfCommandServiceMock implements IDfCommandService {
  public async getDiskSpaceInformation(): Promise<DiskSpaceInformation> {
    return {
      available: 0,
      used: 0,
    };
  }
}

export const DfCommand = getServicesWithMock<IDfCommandService>(DfCommandService, DfCommandServiceMock);
