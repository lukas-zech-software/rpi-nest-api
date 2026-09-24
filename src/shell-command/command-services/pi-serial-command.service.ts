import { Injectable } from '@nestjs/common';
import { getServicesWithMock } from '../../types/utils';
import { ChildProcessService } from '../child-process.service';

export const TEST_DEFAULT_PASSWORD = 'test-default-password';
export const TEST_SERIAL = 'test-serial';

interface IRasPiSerialCommandService {
  getDefaultPassword(): Promise<string>;
  getSerial(): Promise<string>;
}

@Injectable()
export class RasPiSerialCommandService implements IRasPiSerialCommandService {
  constructor(private shellCommandService: ChildProcessService) {}

  /**
   * Get the default password
   */
  public async getDefaultPassword(): Promise<string> {
    const output = await this.shellCommandService.spawnAuthorized(
      'cat /sys/firmware/devicetree/base/serial-number',
      [],
      {
        shell: true,
      },
    );
    return output.trim();
  }

  /**
   * Get the serial
   */
  public async getSerial(): Promise<string> {
    const output = await this.shellCommandService.spawnAuthorized(
      'cat /sys/firmware/devicetree/base/serial-number',
      [],
      {
        shell: true,
      },
    );
    return output.trim();
  }
}

@Injectable()
export class RasPiSerialCommandServiceMock implements IRasPiSerialCommandService {
  public async getDefaultPassword(): Promise<string> {
    return TEST_DEFAULT_PASSWORD;
  }

  public async getSerial(): Promise<string> {
    return TEST_SERIAL;
  }
}

export const RasPiSerialCommand = getServicesWithMock<IRasPiSerialCommandService>(
  RasPiSerialCommandService,
  RasPiSerialCommandServiceMock,
);
