import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { ensureDirSync } from './utils/fs';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { seedDatabase } from './scripts/seed-on-startup';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });
  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') ?? 3000);
  const cookieSecret = config.get('COOKIE_SECRET') ?? 'autosite-cookie-secret';
  app.use(cookieParser(cookieSecret));
  app.setGlobalPrefix('api');
  
  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'uploads');
  ensureDirSync(uploadsDir);
  ensureDirSync(join(uploadsDir, 'models'));
  
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads',
  });
  
  // Root endpoint
  app.getHttpAdapter().get('/', (req: any, res: any) => {
    res.json({
      message: 'Autosite API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        models: '/api/diecast-models',
        auth: '/api/auth',
      },
    });
  });
  
  // Run migrations and seed database on startup
  try {
    const dataSource = app.get<DataSource>(getDataSourceToken());
    
    // Run pending migrations
    console.log('🔄 Running database migrations...');
    const pendingMigrations = await dataSource.showMigrations();
    if (pendingMigrations) {
      console.log('📝 Pending migrations found, executing...');
      await dataSource.runMigrations();
      console.log('✅ Migrations completed');
    } else {
      console.log('✅ No pending migrations');
    }
    
    // Auto-seed database (only if empty)
    console.log('🌱 Starting database seed check...');
    await seedDatabase(dataSource);
    console.log('✅ Seed check completed');
  } catch (error) {
    console.error('❌ STARTUP ERROR:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    // Continue anyway - server should still start
  }
  
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Connected via DATABASE_URL' : 'Using individual DB vars'}`);
}

bootstrap();
