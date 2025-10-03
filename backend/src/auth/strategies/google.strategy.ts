import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { Roles } from '../../constants/roles';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly users: UserService,
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
    
    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth credentials are missing. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL') ?? 'http://localhost:3000/api/auth/google/callback',
      scope: ['profile', 'email'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any): Promise<any> {
    const email = profile.emails?.[0]?.value;
    if (!email) return null;

    const existing = await this.users.findByEmail(email);
    if (!existing) {
      const created = await this.users.create({
        email,
        name: profile.displayName ?? email,
        isActive: true,
        roles: [Roles.USER],
      });
      return this.authService.issueTokenFor(created);
    }

    return this.authService.issueTokenFor(this.users.toPublic(existing));
  }
}
