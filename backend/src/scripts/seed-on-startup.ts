import { DataSource } from 'typeorm';
import { DiecastModel } from '../entities/diecast-model.entity';
import { Team } from '../entities/team.entity';
import { User } from '../entities/user.entity';
import { hashPassword } from '../utils/password';
import { Roles } from '../constants/roles';
import { readFileSync, accessSync } from 'fs';
import { join, resolve } from 'path';

function normalize(name: string): string {
	return name.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}

function csvPath(): string {
	const env = process.env.AUTOSITE_COLLECTION_CSV;
	if (env) return resolve(env);
	
	const distPath = join(process.cwd(), 'collection.csv');
	const rootPath = join(process.cwd(), '..', 'collection.csv');
	
	try {
		accessSync(distPath);
		return distPath;
	} catch {
		return rootPath;
	}
}

export async function seedDatabase(dataSource: DataSource): Promise<void> {
	try {
		const dmRepo = dataSource.getRepository(DiecastModel);
		const teamRepo = dataSource.getRepository(Team);
		const userRepo = dataSource.getRepository(User);

		// Check if already seeded
		const modelCount = await dmRepo.count();
		const userCount = await userRepo.count();

		console.log(`📊 Current database state: ${modelCount} models, ${userCount} users`);

		if (modelCount > 0 && userCount > 0) {
			console.log('✅ Database already seeded, skipping...');
			return;
		}

		// Create admin user
		const adminEmail = process.env.ADMIN_EMAIL || 'admin@autosite.com';
		const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
		
		const existingAdmin = await userRepo.findOne({ where: { email: adminEmail } });
		if (!existingAdmin) {
			console.log('👤 Creating admin user...');
			const admin = userRepo.create({
				email: adminEmail,
				name: 'Admin',
				passwordHash: await hashPassword(adminPassword),
				roles: [Roles.ADMIN],
				isActive: true,
			});
			await userRepo.save(admin);
			console.log(`✅ Admin created: ${adminEmail} / ${adminPassword}`);
		}

		// Seed models if empty
		if (modelCount === 0) {
			console.log('📦 Seeding models from CSV...');
			const file = csvPath();
			console.log(`   Loading CSV from: ${file}`);
			
			try {
				const raw = readFileSync(file, 'utf-8');
				const lines = raw.split(/\r?\n/).filter(l => l.length > 0);
				
				if (lines.length === 0) {
					console.warn('⚠️  CSV file is empty');
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

					if (existing) continue;

					const model = dmRepo.create(payload);
					await dmRepo.save(model);
					seeded++;
				}

				console.log(`✅ Seeded ${seeded} models from CSV`);
			} catch (csvError) {
				console.error('❌ Error seeding CSV:', csvError);
			}
		}

		const finalModelCount = await dmRepo.count();
		const finalUserCount = await userRepo.count();
		console.log(`✅ Database seeded: ${finalModelCount} models, ${finalUserCount} users`);
	} catch (error) {
		console.error('❌ Error during seeding:', error);
		// Don't throw - let server start anyway
	}
}

