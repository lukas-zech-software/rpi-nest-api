import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { RasPiSerialCommandService } from '../../shell-command/command-services/pi-serial-command.service';
const randomBytesAsync = promisify(randomBytes);

// TODO: Measure how long salt rounds take on device
//  Maybe move to config and adapt to device
const SALT_ROUNDS = 10;

@Injectable()
export class CryptoService {
  constructor(private rasPiSerialCommandService: RasPiSerialCommandService) {}

  async getDeviceDefaultPassword(): Promise<string> {
    return this.rasPiSerialCommandService.getDefaultPassword();
  }

  async generateRandomString(length: number): Promise<string> {
    const buffer = await randomBytesAsync(length);
    return buffer.toString('ascii');
  }

  async hashPassword(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
  }

  async comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hash);
  }
}
