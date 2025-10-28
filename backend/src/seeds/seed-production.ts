import 'dotenv/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DataSource } from 'typeorm';
import { DiecastModel } from '../entities/diecast-model.entity';
import { Team } from '../entities/team.entity';

function normalize(name: string): string {
	return name.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}

function csvPath(): string {
	const env = process.env.AUTOSITE_COLLECTION_CSV;
	if (env) return path.resolve(env);
	
	// In production build: backend/dist/seeds/seed-production.js
	// Try dist/collection.csv first, then go up
	const distPath = path.join(__dirname, '..', 'collection.csv');
	const rootPath = path.join(__dirname, '..', '..', '..', 'collection.csv');
	
	try {
		fs.accessSync(distPath);
		return distPath;
	} catch {
		return rootPath;
	}
}

async function main() {
	// Create DataSource from DATABASE_URL or individual vars
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
		entities: [DiecastModel, Team],
		synchronize: false,
		logging: false,
	});

	await dataSource.initialize();
	
	const dmRepo = dataSource.getRepository(DiecastModel);
	const teamRepo = dataSource.getRepository(Team);

	// Check if database already has data
	const existingCount = await dmRepo.count();
	if (existingCount > 0) {
		console.log(`Database already has ${existingCount} models, skipping seed`);
		await dataSource.destroy();
		return;
	}

	const file = csvPath();
	console.log(`Loading CSV from: ${file}`);
	const raw = fs.readFileSync(file, 'utf-8');
	const lines = raw.split(/\r?\n/).filter(l => l.length > 0);
	
	if (lines.length === 0) {
		console.warn('CSV file is empty');
		await dataSource.destroy();
		return;
	}

	const headers = lines[0].split(',');
	const data = lines.slice(1).filter(l => !l.startsWith(headers[0] + ','));
	const normHeaders = headers.map(normalize);

	let seeded = 0;
	for (const line of data) {
		const cols = line.split(',');
		const rec: Record<string, string> = {} as any;
		for (let i = 0; i < normHeaders.length; i++) {
			rec[normHeaders[i]] = i < cols.length ? cols[i] : '';
		}

		const teamName = (rec['numbers'] || '').trim() || null;
		let team: Team | null = null;
		if (teamName) {
			team = await teamRepo.findOne({ where: { name: teamName } });
			if (!team) {
				team = teamRepo.create({ name: teamName });
				team = await teamRepo.save(team);
			}
		}

		const payload = {
			year: rec['year'] || '',
			what: rec['what'] || '',
			scale: rec['scale'] || '',
			specs: rec['specs'] || '',
			numbers: rec['numbers'] || '',
			price: rec['price'] || '',
			teamId: team?.id ?? null,
			imageUrls: [] as string[],
		};

		// Parse images if present
		if (rec['images']) {
			payload.imageUrls = rec['images'].split(',').map((img: string) => img.trim()).filter(Boolean);
		}

		const existing = await dmRepo.findOne({
			where: {
				year: payload.year,
				what: payload.what,
				scale: payload.scale,
				numbers: payload.numbers,
			},
		});

		if (existing) {
			continue;
		}

		const model = dmRepo.create(payload);
		await dmRepo.save(model);
		seeded++;
	}

	await dataSource.destroy();
	console.log(`✅ Seeded ${seeded} models from CSV into database`);
}

main().catch((err) => {
	console.error('Seed error:', err);
	process.exit(1);
});

