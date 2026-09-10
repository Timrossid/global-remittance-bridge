export enum Role {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.USER]: [Role.USER],
  [Role.MERCHANT]: [Role.USER, Role.MERCHANT],
  [Role.ADMIN]: [Role.USER, Role.MERCHANT, Role.ADMIN],
  [Role.SUPER_ADMIN]: [Role.USER, Role.MERCHANT, Role.ADMIN, Role.SUPER_ADMIN],
};

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole]?.includes(requiredRole) ?? false;
}

export function hasAnyRole(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.some((role) => hasRole(userRole, role));
}
