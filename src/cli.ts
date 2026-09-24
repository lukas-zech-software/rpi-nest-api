import { AppModule } from './app.module';
import { CommandFactory } from 'nest-commander';
import * as process from 'process';

const VERBOSE = process.argv.includes('--verbose');

async function bootstrap() {
  VERBOSE && console.log(`Starting rpi-nest-cli command: ${process.argv.join(' ')}`);
  await CommandFactory.run(AppModule, {
    logger: VERBOSE ? ['log', 'error', 'warn', 'debug', 'verbose'] : ['error'],
    serviceErrorHandler: (error) => {
      console.error(`ERROR:: ${error.message}`);
      process.exit(1);
    },
  });
  VERBOSE && console.log('Finished rpi-nest-cli command');
}

bootstrap()
  .catch((e) => console.error('ERROR [cli] bootstrap failed', e))
  .then(() => {
    // the API will never exit naturally as it keeps some open listeners indefinitely
    // therefore we need to end the process manually
    process.exit(0);
  });
