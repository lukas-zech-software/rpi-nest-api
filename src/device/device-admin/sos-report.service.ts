import { pack } from 'tar-fs';
import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { mkdir, rm } from 'node:fs/promises';
import { createGzip } from 'node:zlib';
import { join } from 'node:path';
import { Systemd1Service } from '../../dbus/interfaces/systemd1/systemd1.service';
import { apiConfig } from '../../config/config';
import { ConfigType } from '@nestjs/config';

function wait(waitTimeMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, waitTimeMs));
}

const SYSTEMD_SERVICE_NAME = 'rpi-nest-api-sos-report.service';

// TODO: This class is missing unit tests
// TODO: This part must be covered in unit and system tests
@Injectable()
export class SosReportService {
  private readonly logger = new Logger(SosReportService.name);
  private readonly reportPath: string;

  constructor(
    @Inject(apiConfig.KEY) private config: ConfigType<typeof apiConfig>,
    private systemd1Service: Systemd1Service,
  ) {
    this.reportPath = join(config.uploadPath, 'rpi-nest-sos-report');
  }

  public async createReportStream(): Promise<Readable> {
    await this.ensureUploadDirectoryExists();

    const isSosReportRunning = await this.isReportServiceRunning();
    if (isSosReportRunning) {
      throw new ConflictException('Report service already running');
    }

    this.logger.verbose('Generating report ...');

    await this.systemd1Service.StartUnit(SYSTEMD_SERVICE_NAME);
    await this.waitForReportService();

    const gzipStream = createGzip();
    pipeline(pack(this.reportPath), gzipStream).finally(async () => {
      await this.deleteReportDirectory();
    });

    return gzipStream;
  }

  private async waitForReportService() {
    let isSosReportRunning: boolean;
    // TODO: Polling service state because dbus-native does not support signals
    do {
      await wait(1000);
      isSosReportRunning = await this.isReportServiceRunning();
    } while (isSosReportRunning);

    this.logger.debug(`Generating report finished`);
  }

  private async isReportServiceRunning(): Promise<boolean> {
    const props = await this.systemd1Service.GetUnitProperties(SYSTEMD_SERVICE_NAME);

    if (props === undefined) {
      throw new Error(`Could not get ${SYSTEMD_SERVICE_NAME} unit properties`);
    }

    const { ActiveState, SubState } = props;

    this.logger.debug(`Current service state: ${ActiveState} / ${SubState}`);

    const isRunning = ActiveState === 'active' && SubState === 'running';
    const isDeactivating = ActiveState === 'deactivating';

    return isRunning || isDeactivating;
  }

  private async ensureUploadDirectoryExists(): Promise<void> {
    try {
      await mkdir(this.config.uploadPath, { mode: 0o770, recursive: true });
      this.logger.debug(`Upload directory ${this.config.uploadPath} created`);
    } catch (error) {
      this.logger.error(`Creating upload directory ${this.config.uploadPath} failed`, error);
    }
  }

  private async deleteReportDirectory(): Promise<void> {
    try {
      await rm(this.reportPath, { force: true, recursive: true });
      this.logger.debug(`Report directory ${this.reportPath} deleted`);
    } catch (error) {
      this.logger.error(`Deleting report directory ${this.reportPath} failed`, error);
    }
  }
}
