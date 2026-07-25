import { ApiProperty } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { PermissionEntity } from '../../permissions/entities/permission.entity';

export class RoleEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: UserRoleType })
  name: UserRoleType;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RoleWithPermissionsEntity extends RoleEntity {
  @ApiProperty({ type: [PermissionEntity] })
  permissions: PermissionEntity[];

  @ApiProperty()
  userCount: number;
}
