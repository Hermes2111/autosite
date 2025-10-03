import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { DiecastModelModule } from './diecast-model/diecast-model.module';
import { UserModule } from './user/user.module';
import { TeamModule } from './team/team.module';
import { DriverModule } from './driver/driver.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { WatchlistModule } from './watchlist/watchlist.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: () => ({
				type: 'postgres',
				host: process.env.DB_HOST || 'localhost',
				port: Number(process.env.DB_PORT || 5432),
				username: process.env.DB_USER || 'devusr',
				password: process.env.DB_PASSWORD || 'devpwd',
				database: process.env.DB_NAME || 'autosite',
				autoLoadEntities: true,
				synchronize: false,
			}),
		}),
		HealthModule,
		DiecastModelModule,
		UserModule,
		TeamModule,
		DriverModule,
		AuthModule,
		AdminModule,
		WatchlistModule,
	],
})
export class AppModule {}
