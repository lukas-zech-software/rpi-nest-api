import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { apiConfig } from './config/config';
import { ConfigType } from '@nestjs/config';
import { initOpenApi } from './open-api/open-api.service';
import { RequestHandler } from 'express';

function addHttpMiddleware(app: NestExpressApplication, isProduction: boolean) {
  const appUse = (fn: RequestHandler) => app.use(fn);
  /**
   * Security related HTTP headers recommended by OWASP
   * {@see https://github.com/helmetjs/helmet}
   */
  if (isProduction) {
    // TODO: Enable once server uses HTTPS on rpi-nest
    // appUse(helmet());
  }

  /**
   * Clacks Protocol Header for "Keep-Alive"
   * {@see http://www.gnuterrypratchett.com/}
   */
  appUse((req, res, next) => {
    res.setHeader('X-Clacks-Overhead', 'GNU Terry Pratchett');
    next();
  });

  appUse((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    next();
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  const config = app.get<ConfigType<typeof apiConfig>>(apiConfig.KEY);

  addHttpMiddleware(app, config.isProduction);
  initOpenApi(app, config);

  if (config.writeSpecOnly === true) {
    console.log('Quiting after API specification was written');
    return;
  }

  await app.listen(config.port);
}

bootstrap().catch((e) => console.error('ERROR [main] bootstrap failed', e));
