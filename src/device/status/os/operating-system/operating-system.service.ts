import { Injectable } from '@nestjs/common';
import { hostname } from 'os';

@Injectable()
export class OperatingSystemService {
  getHostname(): string {
    return hostname();
  }
}
