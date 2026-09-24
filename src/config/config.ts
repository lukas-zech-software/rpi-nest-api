import { hostname } from 'os';
import * as process from 'process';
import { join } from 'path';
import { registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces/config-factory.interface';
import { getEnvironmentVariables } from './environment.utils';

export const apiConfig = registerAs('api', () => {
  const environment = getEnvironmentVariables(process.env);
  return {
    environmentLabel: environment.NODE_ENV,
    isProduction: environment.NODE_ENV === 'production',
    writeSpecOnly: environment.WRITE_SPEC_ONLY === 'true',
    logLevel: environment.LOG_LEVEL,
    port: environment.API_PORT,
    hostname: hostname().toLowerCase(),
    protocol: 'http',
    uploadPath: join(environment.DATA_DIR, '/upload'),
  };
});

export const authConfig = registerAs('authentication', () => {
  const environment = getEnvironmentVariables(process.env);
  return {
    jwtSecret: environment.JWT_SECRET,
    accessExpiration: environment.JWT_EXPIRE,
  };
});

export const datastoreConfig = registerAs('datastore', () => {
  const environment = getEnvironmentVariables(process.env);
  return {
    rootDbPath: join(environment.DATA_DIR, '/datastore'),
  };
});

export default [apiConfig, authConfig, datastoreConfig] as Array<ConfigFactory>;
