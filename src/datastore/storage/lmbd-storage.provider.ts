import { Inject, Injectable, Logger } from '@nestjs/common';
import { DatabaseOptions, open, RootDatabase, Key } from 'lmdb';
import { datastoreConfig } from '../../config/config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class LmbdStorageProvider<TValue, TKey extends Key = Key> {
  private readonly rootDb: RootDatabase<TValue, TKey>;
  private readonly logger = new Logger(LmbdStorageProvider.name);

  constructor(@Inject(datastoreConfig.KEY) config: ConfigType<typeof datastoreConfig>) {
    const dbFilePath = `${config.rootDbPath}/rpi-nest-api.db`;
    this.logger.verbose(`Opening LMDB root database from "${dbFilePath}"`);

    this.rootDb = open({
      path: dbFilePath,
      noSubdir: true,
      // TODO: Enable versioning?
      // useVersions: true,
      encoding: 'msgpack',
      // delay commits to bundle more commit in a single transaction to reduce I/O on the eMMC
      commitDelay: 100,
      // compression is not needed and would just waste ressources
      compression: false,
      // Cacheing reduces the read operations
      cache: true,
      // optional encryption
      // encryptionKey:''
      noMemInit: true,
      remapChunks: true,
    });
  }

  public getStore(dbName: string, options: DatabaseOptions = {}) {
    return this.rootDb.openDB(dbName, options);
  }
}
