import { DataSource } from 'typeorm';
import { join, resolve } from 'path';
import { readFileSync, accessSync } from 'fs';
import { DiecastModel } from '../entities/diecast-model.entity';
import { Team } from '../entities/team.entity';

function normalize(name: string): string {
	return name.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}

function csvPath(): string {
	const env = process.env.AUTOSITE_COLLECTION_CSV;
	if (env) return resolve(env);
	// In build: backend/dist/scripts/auto-seed.js
	const distPath = join(__dirname, '..', 'collection.csv');
	const rootPath = join(__dirname, '..', '..', '..', 'collection.csv');
	try {
		accessSync(distPath);
		return distPath;
	} catch {
		return rootPath;
	}
}

export async function autoSeedIfEmpty(dataSource: DataSource): Promise<void> {
	try {
		const dmRepo = dataSource.getRepository(DiecastModel);
		const count = await dmRepo.count();
		
		if (count > 0) {
			console.log(`Database already has ${count} models, skipping seed`);
			return;
		}

		console.log('Database is empty, seeding from CSV...');
		
		const teamRepo = dataSource.getRepository(Team);
		const file = csvPath();
		
		console.log(`Loading CSV from: ${file}`);
		const raw = readFileSync(file, 'utf-8');
		const lines = raw.split(/\r?\n/).filter(l => l.length > 0);
		
		if (lines.length === 0) {
			console.warn('CSV file is empty, nothing to seed');
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

		console.log(`✅ Seeded ${seeded} models from CSV`);
	} catch (error) {
		console.error('❌ Error during auto-seed:', error);
		// Don't throw - just log the error so the server can still start
	}
}

