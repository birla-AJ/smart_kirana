import { ApiProperty } from '@nestjs/swagger';
import { UserRoleType, UserStatus } from '@prisma/client';

export class AdminEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty()
  email: string;

  @ApiProperty()
  mobile: string;

  @ApiProperty({ enum: UserRoleType })
  role: UserRoleType;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ nullable: true })
  designation: string | null;

  @ApiProperty({ nullable: true })
  employeeCode: string | null;

  @ApiProperty()
  createdAt: Date;
}
