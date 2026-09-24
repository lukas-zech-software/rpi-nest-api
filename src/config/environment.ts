import { LogLevel } from '@nestjs/common';
import { IsDefined, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export type Environment = 'development' | 'production' | 'testing';
const Environments: Array<Environment> = ['development', 'production', 'testing'];
const LogLevels: Array<LogLevel> = ['log', 'error', 'warn', 'debug', 'verbose'];

/**
 * This class provides typesafe access to environment variables used in the config
 * It validates and parses values from the environment and provides defaults
 */
export class EnvironmentVariables {
  /**
   * NODE_ENV must be explicitly set by the environment to prevent
   * unintended behaviour by default values
   */
  @IsEnum(Environments, { message: `NODE_ENV must be one of the following values: ${Environments.join(', ')}` })
  @IsDefined({ message: 'NODE_ENV must be provided by the environment. There is no default value' })
  NODE_ENV: Environment;

  // TODO: Init .env on production with random JWT_SECRET ???
  /**
   * JWT Secret must be provided by the environment
   * The must be no default value
   */
  @IsDefined({ message: 'JWT_SECRET must be provided by the environment. There is no default value' })
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsEnum(LogLevels)
  @IsOptional()
  LOG_LEVEL: LogLevel = 'log';

  @IsNumber()
  @IsOptional()
  API_PORT = 3000;

  // TODO: Where will API store data on production?
  @IsString()
  @IsNotEmpty()
  DATA_DIR: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRE = '1d';

  /**
   * If true, only write the API specification file and then exit
   */
  @IsOptional()
  WRITE_SPEC_ONLY? = 'false';
}
