import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  NotEquals,
} from 'class-validator';
import { ACCESS_ROLES, AccessRole, ADMIN_USER_NAME } from '../constants';

/**
 * Data of an user
 */
export class UserDto {
  /**
   * Login for the account
   * Must not be reserved login "admin"
   * @example john@example.com
   */
  @NotEquals(ADMIN_USER_NAME, {
    message: `Login "${ADMIN_USER_NAME}" is reserved and cannot be used`,
  })
  @IsNotEmpty()
  @IsString()
  login: string;

  /**
   * Password of the user
   * @example example_password
   */
  @IsNotEmpty()
  @IsDefined()
  password: string;

  /**
   * Roles of the user
   */
  @ApiProperty({ example: ['user'], type: 'array', items: { enum: ACCESS_ROLES as any }, minItems: 1 })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(ACCESS_ROLES, { each: true })
  roles: AccessRole[];

  /**
   * Description of the user
   * @example "some description"
   */
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * Dto for users returned in lists
 */
export class ListUserDto extends OmitType(UserDto, ['password'] as const) {
  /**
   * Timestamp when this user was created
   * @example 872835282133
   */
  @IsNumber()
  created: number;

  /**
   * Timestamp when this user was last modified
   * @example 872835282133
   */
  @IsNumber()
  modified: number;
}

/**
 * Dto to update an user
 */
export class UpdateUserDto extends PartialType(OmitType(UserDto, ['password'] as const)) {}

/**
 * Dto to delete an user
 * Must contain only the login
 */
export class DeleteUserDto extends PickType(UserDto, ['login'] as const) {}
