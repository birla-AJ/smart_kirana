import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Restricts a route to users whose role has ALL the given permissions.
 * Permission name format: "<module>.<action>", e.g. "products.create".
 * Usage: @Permissions('products.create')
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
