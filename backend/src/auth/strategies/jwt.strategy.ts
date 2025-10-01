import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_AUDIENCE, JWT_ISSUER, JWT_SECRET } from '../constants';
import { SessionUser } from '../interfaces/session-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: JWT_SECRET,
			audience: JWT_AUDIENCE,
			issuer: JWT_ISSUER,
		});
	}

	async validate(payload: any): Promise<SessionUser> {
		return {
			userId: Number(payload.sub),
			roles: Array.isArray(payload.roles) ? payload.roles : [],
		};
	}
}

