import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { verifyPassword } from '../utils/password';
import { Roles } from '../constants/roles';
import { JWT_AUDIENCE, JWT_EXPIRATION, JWT_ISSUER } from './constants';

@Injectable()
export class AuthService {
	constructor(
		private readonly users: UserService,
		private readonly jwt: JwtService,
	) {}

	async login(email: string, password: string) {
		const user = await this.users.findByEmailWithPassword(email);
		if (!user || !user.passwordHash) {
			throw new UnauthorizedException('Invalid credentials');
		}
		const valid = await verifyPassword(password, user.passwordHash);
		if (!valid) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const publicUser = this.users.toPublic(user);
		return this.signUser(publicUser.id, publicUser.roles, publicUser);
	}

	async register(dto: RegisterDto) {
		const user = await this.users.create({
			name: dto.name,
			email: dto.email,
			password: dto.password,
			isActive: true,
			roles: [Roles.USER],
		});

		return this.signUser(user.id, user.roles, user);
	}

	async getProfile(id: number) {
		return this.users.getById(id);
	}

	private async signUser(userId: number, roles: string[], profile: any) {
		const payload = { sub: String(userId), roles };
		const token = await this.jwt.signAsync(payload, {
			audience: JWT_AUDIENCE,
			issuer: JWT_ISSUER,
			expiresIn: JWT_EXPIRATION,
		});

		return { token, user: profile };
	}
}

