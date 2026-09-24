import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './authentication.guard';
import { JwtConfigService } from './jwt.service.factory';
import { CryptoService } from './crypto/crypto.service';
import { DatastoreModule } from '../datastore/datastore.module';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { AllUserCommands } from './user/cli/users.command';
import { AllAuthenticationCommands } from './cli/authentication.command';
import { AuthorizationTestController, AuthorizationTestController2 } from './authorization-test.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    DatastoreModule,
  ],
  controllers: [
    AuthenticationController,
    UserController,
    // TODO: Remove TestControllers
    AuthorizationTestController,
    AuthorizationTestController2,
  ],
  providers: [
    AuthenticationService,
    CryptoService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    UserService,
    ...AllUserCommands,
    ...AllAuthenticationCommands,
  ],
})
export class AuthenticationModule {}
