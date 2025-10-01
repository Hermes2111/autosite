import { SetMetadata } from '@nestjs/common';

export const RolesRequiredKey = 'roles';
export const RolesRequired = (...roles: string[]) => SetMetadata(RolesRequiredKey, roles);
