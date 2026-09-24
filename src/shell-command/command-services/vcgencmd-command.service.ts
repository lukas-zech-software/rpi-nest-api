import { Injectable, Logger } from '@nestjs/common';
import { getServicesWithMock } from '../../types/utils';
import { ChildProcessService } from '../child-process.service';

const RESULT_REGEX = /(\d+\.\d+)/;
const VCGENCMD_EXECUTABLE = '/usr/bin/vcgencmd';

enum VCGENCMD_ARGUMENTS {
  temperature = 'measure_temp',
  coreVoltage = 'measure_volts core',
}

interface IVcGenCmdCommandService {
  getTemperature(): Promise<number>;

  getCoreVoltage(): Promise<number>;
}

@Injectable()
export class VcGenCmdCommandService implements IVcGenCmdCommandService {
  private readonly logger = new Logger(VcGenCmdCommandService.name);

  constructor(private shellCommandService: ChildProcessService) {}

  /**
   * get the system's temperature in degree celsius
   */
  public async getTemperature(): Promise<number> {
    // TODO: Migrate to pkexec
    const result = await this.shellCommandService.spawnAuthorized(
      VCGENCMD_EXECUTABLE,
      [VCGENCMD_ARGUMENTS.temperature],
      {
        shell: true,
      },
    );

    return this.parseResult(result);
  }

  /**
   * get the cpu's voltage in volt
   */
  public async getCoreVoltage(): Promise<number> {
    const result = await this.shellCommandService.spawnAuthorized(
      VCGENCMD_EXECUTABLE,
      [VCGENCMD_ARGUMENTS.coreVoltage],
      {
        shell: true,
      },
    );

    return this.parseResult(result);
  }

  private parseResult(input: string): number {
    const match = RESULT_REGEX.exec(input);
    const matchedString = match?.[0] ?? '';
    const parsed = Number.parseFloat(matchedString);

    if (Number.isNaN(parsed)) {
      this.logger.error('vcgencmd returned unparsable result', { input });
      throw new Error('vcgencmd returned unparsable result');
    }

    return parsed;
  }
}

@Injectable()
export class VcGenCmdCommandServiceMock implements IVcGenCmdCommandService {
  public async getTemperature(): Promise<number> {
    return 42.24;
  }

  public async getCoreVoltage(): Promise<number> {
    return 13.37;
  }
}

export const VcGenCmdCommand = getServicesWithMock<IVcGenCmdCommandService>(
  VcGenCmdCommandService,
  VcGenCmdCommandServiceMock,
);
