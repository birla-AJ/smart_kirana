import { SetMetadata } from '@nestjs/common';
import { UserRoleType } from '@prisma/client';

export const ROLES_KEY = 'roles';


/**
 * Restricts a route to one or more roles.
 * Usage: @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
 */
export const Roles = (...roles: UserRoleType[]) => SetMetadata(ROLES_KEY, roles);
