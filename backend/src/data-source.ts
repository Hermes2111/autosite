import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Team } from './entities/team.entity';
import { Driver } from './entities/driver.entity';
import { DiecastModel } from './entities/diecast-model.entity';
import { WatchlistItem } from './watchlist/entities/watchlist-item.entity';

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST || 'localhost',
	port: Number(process.env.DB_PORT || 5432),
	username: process.env.DB_USER || 'devusr',
	password: process.env.DB_PASSWORD || 'devpwd',
	database: process.env.DB_NAME || 'autosite',
	entities: [User, Team, Driver, DiecastModel, WatchlistItem],
	migrations: ['src/migrations/*.ts'],
	synchronize: false,
	logging: false,
});
