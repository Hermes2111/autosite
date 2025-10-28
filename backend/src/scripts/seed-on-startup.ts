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
	console.log('🔍 Checking database state...');
	try {
		// Ensure dataSource is initialized
		if (!dataSource.isInitialized) {
			console.log('⚠️ DataSource not initialized, initializing...');
			await dataSource.initialize();
		}
		
		// FIX DATABASE SCHEMA FIRST - handle password column issue
		console.log('🔧 Fixing database schema...');
		try {
			// Check if password column exists and rename/drop it
			await dataSource.query(`
				DO $$ 
				BEGIN
					-- If password column exists but password_hash doesn't, rename it
					IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') 
					   AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
						ALTER TABLE "users" RENAME COLUMN "password" TO "password_hash";
						RAISE NOTICE 'Renamed password to password_hash';
					END IF;
					
					-- If password_hash doesn't exist, add it
					IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
						ALTER TABLE "users" ADD COLUMN "password_hash" VARCHAR;
						RAISE NOTICE 'Added password_hash column';
					END IF;
					
					-- If both password and password_hash exist, drop password
					IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') 
					   AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
						ALTER TABLE "users" DROP COLUMN "password";
						RAISE NOTICE 'Dropped old password column';
					END IF;
					
					-- Add roles column if missing
					IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='roles') THEN
						ALTER TABLE "users" ADD COLUMN "roles" VARCHAR[] DEFAULT '{user}';
						RAISE NOTICE 'Added roles column';
					END IF;
				END $$;
			`);
			console.log('✅ Database schema fixed');
		} catch (schemaError) {
			console.error('⚠️  Schema fix error (continuing anyway):', schemaError instanceof Error ? schemaError.message : String(schemaError));
		}
		
		const dmRepo = dataSource.getRepository(DiecastModel);
		const teamRepo = dataSource.getRepository(Team);
		const userRepo = dataSource.getRepository(User);
		
		console.log('✅ Repositories obtained');

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
		console.error('❌ ERROR during seeding:');
		console.error('Error message:', error instanceof Error ? error.message : String(error));
		console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
		console.error('Full error:', error);
		// Don't throw - let server start anyway
	}
}

