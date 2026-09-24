import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { authConfig } from '../config/config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(@Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>) {}

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.config.jwtSecret,
      signOptions: { expiresIn: this.config.accessExpiration },
    };
  }
}
