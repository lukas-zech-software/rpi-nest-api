import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Put } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RpiApiTags } from '../../open-api/constants';
import { DeleteUserDto, UpdateUserDto, UserDto } from '../dto/user.dto';
import { UserService } from './user.service';

@RpiApiTags('Authentication')
@ApiBearerAuth()
@Controller('authentication/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get a list of all users
   */
  @HttpCode(HttpStatus.OK)
  @Get()
  getAll() {
    return this.userService.getAllUsers();
  }

  /**
   * Update a user
   */
  @HttpCode(HttpStatus.OK)
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto);
  }

  /**
   * Create an new user
   */
  @HttpCode(HttpStatus.OK)
  @Put()
  create(@Body() createUserDto: UserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * Delete an user
   */
  @HttpCode(HttpStatus.OK)
  @Delete()
  remove(@Body() deleteUserDto: DeleteUserDto) {
    return this.userService.remove(deleteUserDto.login);
  }
}
