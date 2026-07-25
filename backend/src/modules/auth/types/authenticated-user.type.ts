import { UserRoleType } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  mobile: string;
  email: string | null;
  roleId: string;
  role: UserRoleType;
  permissions: string[];
}
