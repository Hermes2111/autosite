import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RolesRequiredKey } from '../roles.decorator';
import { SessionUser } from '../interfaces/session-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const requiredRoles = this.reflector.getAllAndMerge<string[]>(RolesRequiredKey, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!requiredRoles || requiredRoles.length === 0) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user: SessionUser | undefined = request.user;

		if (!user) {
			return false;
		}

		const userRoles = user.roles ?? [];
		return requiredRoles.some(role => userRoles.includes(role));
	}
}

