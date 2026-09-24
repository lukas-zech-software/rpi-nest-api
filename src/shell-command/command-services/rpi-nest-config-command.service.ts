import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { getServicesWithMock } from '../../types/utils';
import { ChildProcessService } from '../child-process.service';

const RPI_CONFIG_EXECUTABLE = '/usr/bin/raspi-config';

/**
 * The availability and status of a feature can also be queried simultaneously using the availstat command. The return value is 2 if the
 * feature is not available, 1 if the feature is available and enabled and 0 if the feature is available but not enabled.
 * {@see raspi-config manpage}
 */
enum AvailStatReturnValue {
  disabled = '0',
  enabled = '1',
  notAvailable = '2',
}

export type RpiConfigurationState = {
  isEnabled: boolean;
  isAvailable: boolean;
  value?: string;
};

export type RpiConfigCommand = 'enable' | 'disable' | 'status' | 'available' | 'availstat';

export type RpiConfigurationId = string;

interface IRpiConfigCommandService {
  getSupportedConfigurations(): Promise<RpiConfigurationId[]>;

  enableConfiguration(id: RpiConfigurationId, ...args: any[]): Promise<void>;

  disableConfiguration(id: RpiConfigurationId): Promise<void>;

  getConfigurationStates(ids: RpiConfigurationId[]): Promise<RpiConfigurationState[]>;
}

function parseStatus(result: string): RpiConfigurationState {
  switch (result) {
    case AvailStatReturnValue.enabled:
      return {
        isAvailable: true,
        isEnabled: true,
      };
    case AvailStatReturnValue.disabled: {
      return {
        isAvailable: true,
        isEnabled: false,
      };
    }
    case AvailStatReturnValue.notAvailable:
      return {
        isAvailable: false,
        isEnabled: false,
      };
    default:
      throw new Error(`raspi-config availstat returned unexpected value ${result}`);
  }
}

@Injectable()
export class RpiConfigCommandService implements IRpiConfigCommandService {
  private readonly logger = new Logger(RpiConfigCommandService.name);

  constructor(private childProcessService: ChildProcessService) {}

  public async getSupportedConfigurations(): Promise<RpiConfigurationId[]> {
    // Spawn without args to get Usage
    const result = await this.childProcessService.spawnAuthorized(RPI_CONFIG_EXECUTABLE, [], {
      shell: true,
    });

    // Parse usage output, remove whitespaces and get list of values
    return (
      result
        ?.split('Supported features: ')[1]
        ?.replaceAll('\n', '')
        ?.split(' ')
        ?.filter((x) => x.length !== 0) ?? []
    );
  }

  public async enableConfiguration(id: RpiConfigurationId, value?: string): Promise<void> {
    await this.executeCommand('enable', id, value);
  }

  public async disableConfiguration(id: RpiConfigurationId): Promise<void> {
    await this.executeCommand('disable', id);
  }

  public async getConfigurationStates(ids: RpiConfigurationId[]): Promise<RpiConfigurationState[]> {
    const resultString = await this.executeCommand('availstat', ids.join(' '));
    return resultString.split(' ').map(parseStatus);
  }

  public async getConfigurationStatus(id: RpiConfigurationId): Promise<RpiConfigurationState> {
    const resultString = await this.executeCommand('status', id);
    const result = resultString.split(' ');

    if (result.length === 2) {
      return {
        ...parseStatus(result[1]),
        value: result[0],
      };
    }

    return {
      ...parseStatus(result[0]),
    };
  }

  private async executeCommand(command: RpiConfigCommand, id: RpiConfigurationId, value?: string): Promise<string> {
    if (id === undefined || id === '') {
      throw new BadRequestException(`Invalid configuration`);
    }

    const args = [command, id];

    if (value) {
      args.push(value);
    }

    const result = await this.childProcessService.spawnAuthorized(RPI_CONFIG_EXECUTABLE, args, {
      shell: true,
    });

    if (result.startsWith('Usage:')) {
      this.logger.error('Invalid command! raspi-config returned usage help message', {
        executable: RPI_CONFIG_EXECUTABLE,
        args: [command, id],
      });
      throw new BadRequestException(`Invalid command! raspi-config returned usage help message`);
    }

    return result.trim();
  }
}

@Injectable()
export class RpiConfigCommandServiceMock implements IRpiConfigCommandService {
  public async disableConfiguration(): Promise<void> {
    return Promise.resolve();
  }

  public async enableConfiguration(): Promise<void> {
    return Promise.resolve();
  }

  public async getConfigurationStates(): Promise<RpiConfigurationState[]> {
    return [
      {
        isAvailable: false,
        isEnabled: false,
      },
    ];
  }

  public async getSupportedConfigurations(): Promise<RpiConfigurationId[]> {
    return [];
  }
}

export const RpiConfigCommand = getServicesWithMock<IRpiConfigCommandService>(
  RpiConfigCommandService,
  RpiConfigCommandServiceMock,
);
