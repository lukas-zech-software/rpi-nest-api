import { Injectable } from '@nestjs/common';
import { getServicesWithMock } from '../../../types/utils';
import { SystemBusService } from '../../system-bus/system-bus.service';
import { unwrapVariantObject } from '../../utils';
import { TimeDate1Proxy } from './timedate1.proxy';
import { DateTimeInfo } from './timedate1.types';

@Injectable()
export class TimeDate1Service implements ITimeDate1Service {
  constructor(private readonly systemBusService: SystemBusService) {}

  public get configFilePath(): string {
    return '/etc/systemd/timesyncd.conf.d/rpi-nest-ntp.conf';
  }

  public async getDateTimeInfo(): Promise<DateTimeInfo> {
    const timeDateProxy = await TimeDate1Proxy.Connect(this.systemBusService.systemBus);

    const properties = await timeDateProxy.getProperties();
    const { Timezone, NTP, TimeUSec } = unwrapVariantObject(properties);

    const timestampInMilliSecondsUTC = Number(TimeUSec / 1000n);

    return {
      date: new Date(timestampInMilliSecondsUTC),
      timeZone: Timezone,
      isNtpEnabled: NTP,
    };
  }

  public async setSystemDate(date: Date): Promise<void> {
    const timeDateProxy = await TimeDate1Proxy.Connect(this.systemBusService.systemBus);

    const timestampInMicroSecondsUTC = BigInt(date.getTime() * 1000);
    await timeDateProxy.SetTime(timestampInMicroSecondsUTC, false);
  }

  public async setTimezone(timezone: string): Promise<void> {
    const timeDateProxy = await TimeDate1Proxy.Connect(this.systemBusService.systemBus);

    await timeDateProxy.SetTimezone(timezone);
  }

  public async getAllTimezones(): Promise<Array<string>> {
    const timeDateProxy = await TimeDate1Proxy.Connect(this.systemBusService.systemBus);

    return timeDateProxy.ListTimezones();
  }

  public async enableNTP(isNtpEnabled: boolean): Promise<void> {
    const timeDateProxy = await TimeDate1Proxy.Connect(this.systemBusService.systemBus);

    await timeDateProxy.SetNTP(isNtpEnabled);
  }
}

interface ITimeDate1Service {
  get configFilePath(): string;

  getDateTimeInfo(): Promise<DateTimeInfo>;

  setSystemDate(date: Date): Promise<void>;

  setTimezone(timezone: string): Promise<void>;

  getAllTimezones(): Promise<Array<string>>;

  enableNTP(isNtpEnabled: boolean): Promise<void>;
}

@Injectable()
export class TimeDate1ServiceMock implements ITimeDate1Service {
  public get configFilePath(): string {
    return '/tmp/rpi-nest-api/rpi-nest-ntp.conf';
  }

  public async enableNTP(): Promise<void> {
    return;
  }

  public async getAllTimezones(): Promise<Array<string>> {
    return ['Antarctica/Troll', 'Europe/Berlin', 'Foo/Bar'];
  }

  public async getDateTimeInfo(): Promise<DateTimeInfo> {
    return {
      date: new Date('2000-01-01T13:37:42.000Z'),
      timeZone: 'Antarctica/Troll',
      isNtpEnabled: false,
    };
  }

  public async setSystemDate(): Promise<void> {
    return;
  }

  public async setTimezone(): Promise<void> {
    return;
  }
}

export const TimeDate1ServiceProvider = getServicesWithMock<ITimeDate1Service>(TimeDate1Service, TimeDate1ServiceMock);
