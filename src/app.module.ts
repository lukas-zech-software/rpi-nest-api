import { Module, ValidationPipe } from '@nestjs/common';
import { DeviceModule } from './device/device.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import config, { apiConfig } from './config/config';
import { OpenApiController } from './open-api/open-api.controller';
import { ShellCommandModule } from './shell-command/shell-command.module';
import { DatastoreModule } from './datastore/datastore.module';
import { RpiApiCliCommand } from './cli/default.command';
import { DbusModule } from './dbus/dbus.module';

/**
 * BigInt currenlty has no implementation serialization and toJSON() throws an error
 * Until there is a native implementation this is the recommended approach
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
 */
(BigInt.prototype as any).toJSON ??= function () {
  return this.toString();
};

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      load: config,
      isGlobal: true,
    }),
    // TODO: Inject config
    ShellCommandModule.register(apiConfig().environmentLabel === 'production'),
    DbusModule.register(apiConfig().environmentLabel === 'production'),
    DeviceModule,
    AuthenticationModule,
    DatastoreModule,
  ],
  controllers: [OpenApiController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    RpiApiCliCommand,
  ],
})
export class AppModule {}
