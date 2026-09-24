import { Controller, Get } from '@nestjs/common';
import { RpiApiTags } from '../open-api/constants';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthorizedRoles, Public } from '../authentication/authentication.guard';

/**
 * For testing role based authorization
 */
@ApiBearerAuth()
@RpiApiTags('Authentication')
@Controller('/authorization-test')
export class AuthorizationTestController {
  /**
   * Accessible without authentication
   */
  @Get('public')
  @Public()
  getPublic() {
    return { result: 'Accessible without authentication' };
  }

  /**
   * Accessible only for admins (default)
   */
  @Get('admin')
  getAdmin() {
    return { result: 'Accessible only for admins (default)' };
  }

  /**
   * Accessible for users and admins (default) but NOT for read-only
   */
  @Get('user')
  @AuthorizedRoles('user')
  getUser() {
    return { result: 'Accessible for users and admins (default) but NOT for read-only' };
  }

  /**
   * Accessible for read-only and admins (default) but NOT for users
   */
  @Get('read-only')
  @AuthorizedRoles('read-only')
  getReadOnly() {
    return { result: 'Accessible for read-only and admins (default) but NOT for users' };
  }

  /**
   * Accessible for read-only, users and admins (default)
   */
  @Get('read-only-and-user')
  @AuthorizedRoles('read-only', 'user')
  getReadOnlyAndUser() {
    return { result: 'Accessible for read-only, users and admins (default)' };
  }
}

@ApiBearerAuth()
@RpiApiTags('Authentication')
@Controller('/authorization-test-user')
/**
 * This allows access for user on ALL sub-routes
 */
@AuthorizedRoles('user')
export class AuthorizationTestController2 {
  /**
   * Accessible for admins (default) AND user (controller-wide)
   */
  @Get('admin')
  getAdmin() {
    return { result: 'Accessible for admins (default) and user (controller-wide)' };
  }

  /**
   * Accessible for read-only and admins (default) AND user (controller-wide)
   */
  @Get('read-only')
  @AuthorizedRoles('read-only')
  getReadOnly() {
    return { result: 'Accessible for read-only and admins (default) AND user (controller-wide)' };
  }
}
