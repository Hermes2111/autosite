import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DiecastModel } from '../entities/diecast-model.entity';
import { Team } from '../entities/team.entity';
import { User } from '../entities/user.entity';

async function main() {
	const dataSource = new DataSource({
		type: 'postgres',
		...(process.env.DATABASE_URL
			? {
					url: process.env.DATABASE_URL,
					ssl: { rejectUnauthorized: false },
			  }
			: {
					host: process.env.DB_HOST || 'localhost',
					port: Number(process.env.DB_PORT || 5432),
					username: process.env.DB_USER || 'devusr',
					password: process.env.DB_PASSWORD || 'devpwd',
					database: process.env.DB_NAME || 'autosite',
			  }),
		entities: [DiecastModel, Team, User],
		synchronize: false,
		logging: false,
	});

	try {
		await dataSource.initialize();
		console.log('✅ Connected to database\n');

		const dmRepo = dataSource.getRepository(DiecastModel);
		const teamRepo = dataSource.getRepository(Team);
		const userRepo = dataSource.getRepository(User);

		const modelCount = await dmRepo.count();
		const teamCount = await teamRepo.count();
		const userCount = await userRepo.count();

		console.log('📊 Database Statistics:');
		console.log(`   Diecast Models: ${modelCount}`);
		console.log(`   Teams: ${teamCount}`);
		console.log(`   Users: ${userCount}\n`);

		if (modelCount > 0) {
			console.log('📦 First 5 Diecast Models:');
			const models = await dmRepo.find({ take: 5 });
			models.forEach((m, i) => {
				console.log(`   ${i + 1}. ${m.year} - ${m.what}`);
			});
		}

		if (teamCount > 0) {
			console.log('\n🏎️  Teams:');
			const teams = await teamRepo.find();
			teams.forEach((t) => {
				console.log(`   - ${t.name}`);
			});
		}

		await dataSource.destroy();
	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}
}

main();

