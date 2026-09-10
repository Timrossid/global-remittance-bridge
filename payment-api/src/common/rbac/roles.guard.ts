import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasAnyRole, Role } from '../rbac/roles';

const ROLES_KEY = 'roles';

export const ROLES = (...roles: Role[]) => (target: any, key?: any, descriptor?: any) => {
  if (descriptor) {
    const metadataKey = ROLES_KEY;
    const roles = roles;
    const existingRoles = Reflector.get('roles', descriptor.value) || [];
    Reflector.defineMetadata(metadataKey, [...existingRoles, ...roles], descriptor.value);
    return descriptor;
  }
  return target;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: no role assigned');
    }

    const hasAccess = hasAnyRole(user.role, requiredRoles);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied: insufficient permissions');
    }

    return true;
  }
}
