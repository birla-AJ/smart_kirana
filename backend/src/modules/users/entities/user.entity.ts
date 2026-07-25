import { ApiProperty } from '@nestjs/swagger';
import { UserRoleType, UserStatus } from '@prisma/client';

/**
 * Safe, password-free representation of a User row, returned by every
 * endpoint in this module.
 */
export class UserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty()
  mobile: string;

  @ApiProperty({ nullable: true })
  email: string | null;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  mobileVerified: boolean;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty({ nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty()
  roleId: string;

  @ApiProperty({ enum: UserRoleType })
  role: UserRoleType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
