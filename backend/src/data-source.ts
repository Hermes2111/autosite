import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Team } from './entities/team.entity';
import { Driver } from './entities/driver.entity';
import { DiecastModel } from './entities/diecast-model.entity';
import { WatchlistItem } from './watchlist/entities/watchlist-item.entity';
import { Customer } from './entities/customer.entity';

// Support both DATABASE_URL (Render) and individual vars (local)
const dataSourceConfig = process.env.DATABASE_URL
	? {
			type: 'postgres' as const,
			url: process.env.DATABASE_URL,
			ssl: {
				rejectUnauthorized: false,
			},
	  }
	: {
			type: 'postgres' as const,
			host: process.env.DB_HOST || 'localhost',
			port: Number(process.env.DB_PORT || 5432),
			username: process.env.DB_USER || 'devusr',
			password: process.env.DB_PASSWORD || 'devpwd',
			database: process.env.DB_NAME || 'autosite',
	  };

export const AppDataSource = new DataSource({
	...dataSourceConfig,
	entities: [User, Team, Driver, DiecastModel, WatchlistItem, Customer],
	// No migrations - we handle schema fixes directly in seed script
	migrations: [],
	synchronize: false,
	logging: false,
});
