import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginDto, UpdatePasswordDto } from './dto/login.dto';
import { Public } from './authentication.guard';
import { RpiApiTags } from '../open-api/constants';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Handles user authentication
 */
@RpiApiTags('Authentication')
@ApiBearerAuth()
@Controller('/authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  /**
   * Get an access token for an user by providing username and password
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authenticationService.login(loginDto.username, loginDto.password);
  }

  /**
   * Update password for an user by providing username, password and the new password
   * @param updatePasswordDto
   */
  @HttpCode(HttpStatus.OK)
  @Post('update-password')
  updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authenticationService.updatePassword(
      updatePasswordDto.username,
      updatePasswordDto.password,
      updatePasswordDto.newPassword,
    );
  }

  /**
   * Reset password for admin user to the device specific default password
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-admin-password')
  resetPassword() {
    return this.authenticationService.resetAdminPassword();
  }
}
