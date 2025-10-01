import 'dotenv/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AppDataSource } from '../data-source';
import { DiecastModel } from '../entities/diecast-model.entity';
import { Team } from '../entities/team.entity';

function normalize(name: string): string {
	return name.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}

function csvPath(): string {
	const env = process.env.AUTOSITE_COLLECTION_CSV;
	if (env) return path.resolve(env);
	// backend/src/seeds -> up three to project root
	return path.resolve(__dirname, '..', '..', '..', 'collection.csv');
}

async function main() {
	await AppDataSource.initialize();
	const dmRepo = AppDataSource.getRepository(DiecastModel);
	const teamRepo = AppDataSource.getRepository(Team);

	const file = csvPath();
	const raw = fs.readFileSync(file, 'utf-8');
	const lines = raw.split(/\r?\n/).filter(l => l.length > 0);
	if (lines.length === 0) return;
	const headers = lines[0].split(',');
	const data = lines.slice(1).filter(l => !l.startsWith(headers[0] + ','));
	const normHeaders = headers.map(normalize);

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
		};

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
	}

	await AppDataSource.destroy();
	
	console.log('Seed completed');
}

main().catch((err) => {
	
	console.error(err);
	process.exit(1);
});
