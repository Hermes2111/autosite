import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { SessionUser } from './interfaces/session-user.interface';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() dto: LoginDto) {
		return this.authService.login(dto.email, dto.password);
	}

	@Post('register')
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	async me(@CurrentUser() user: SessionUser) {
		return this.authService.getProfile(user.userId);
	}

	// Google OAuth temporarily disabled - add credentials to .env to enable
	// @Get('google')
	// @UseGuards(GoogleAuthGuard)
	// googleLogin() {
	// 	return { message: 'Redirecting to Google' };
	// }

	// @Get('google/callback')
	// @UseGuards(GoogleAuthGuard)
	// googleCallback(@Req() req: any, @Res() res: Response) {
	// 	const tokenData = req.user;
	// 	const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
	// 	const redirectUrl = `${frontendUrl}?token=${tokenData.token}`;
	// 	res.redirect(redirectUrl);
	// }
}

