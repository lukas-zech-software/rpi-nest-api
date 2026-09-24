import { CanActivate, ExecutionContext, Injectable, Logger, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { intersection } from 'lodash';
import { Reflector } from '@nestjs/core';
import { AccessTokenPayload } from './dto/login.dto';
import { AccessRole, ADMIN_USER_NAME, RestrictedAccessRole } from './constants';

const IS_PUBLIC_META_KEY = 'isPublic';
const ACCESS_ROLES_META_KEY = 'access-roles';
/**
 * Marks route handler or whole controller as public and accessible without authentication
 * @decorator
 */
export const Public = () => SetMetadata(IS_PUBLIC_META_KEY, true);

/**
 * Marks route handler or whole controller as accessible for users with the provided roles
 * Note: The device admin user and users with role "admin" are always granted access by default
 * @decorator
 */
export const AuthorizedRoles = (...roles: AccessRole[]) => SetMetadata(ACCESS_ROLES_META_KEY, roles);

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name);

  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isRoutePublic(context)) {
      // Public route, no need to check authentication
      const url = context.switchToHttp()?.getRequest()?.url;
      this.logger.verbose(`Authenticating request to public route [${url}]`);
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (typeof token !== 'string') {
      this.logger.verbose(`Blocking request without token`);
      throw new UnauthorizedException();
    }

    try {
      const accessTokenPayload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      return this.isUserAuthorized(context, accessTokenPayload);
    } catch (error) {
      this.logger.warn(`Blocking request with invalid token`, { error: error.toString() });
      throw new UnauthorizedException();
    }
  }

  private isRoutePublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_META_KEY, [context.getHandler(), context.getClass()]);
  }

  private isUserAuthorized(context: ExecutionContext, accessTokenPayload: AccessTokenPayload): boolean {
    if (accessTokenPayload.sub === ADMIN_USER_NAME) {
      this.logger.verbose(`Authenticating request for device admin "${ADMIN_USER_NAME}"`);
      return true;
    }

    if (accessTokenPayload.roles?.includes('admin')) {
      this.logger.verbose(`Authenticating request for user ${accessTokenPayload.sub} with role "admin"`);
      return true;
    }

    const authorizedRoles = this.reflector.getAllAndMerge<RestrictedAccessRole[]>(ACCESS_ROLES_META_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const matchingRoles = intersection(authorizedRoles, accessTokenPayload.roles);

    if (matchingRoles.length !== 0) {
      this.logger.verbose(`Authenticating request for user "${accessTokenPayload.sub}"`, {
        authorizedRoles,
        matchingRoles,
        accessTokenPayload,
      });
      return true;
    }

    this.logger.warn(`Blocking request for unauthorized user "${accessTokenPayload.sub}"`, {
      authorizedRoles,
      accessTokenPayload,
    });
    return false;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
