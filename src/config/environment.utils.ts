import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentVariables } from './environment';

let cachedEnv: EnvironmentVariables | undefined = undefined;

export function getEnvironmentVariables(config: Record<string, unknown>) {
  if (cachedEnv === undefined) {
    cachedEnv = createValidateEnvironment(config);
  }
  return cachedEnv;
}

export function createValidateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    let errorMessage = 'Validation for environment variables failed';
    errors.forEach((e) => {
      if (e.constraints) {
        for (const [, message] of Object.entries(e.constraints)) {
          errorMessage += `\n-> ${message}`;
        }
      }
    });

    throw new Error(errorMessage);
  }

  return validatedConfig;
}
