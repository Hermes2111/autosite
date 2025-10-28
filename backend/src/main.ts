import 'dotenv/config';
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
import { AppDataSource } from './data-source';

async function bootstrap() {
  // Initialize standalone DataSource BEFORE NestJS app
  console.log('🔌 Initializing standalone DataSource...');
  try {
    await AppDataSource.initialize();
    console.log('✅ DataSource initialized');
    
    // Run pending migrations
    console.log('🔄 Running database migrations...');
    const pendingMigrations = await AppDataSource.showMigrations();
    if (pendingMigrations) {
      console.log('📝 Pending migrations found, executing...');
      await AppDataSource.runMigrations();
      console.log('✅ Migrations completed');
    } else {
      console.log('✅ No pending migrations');
    }
    
    // Seed database
    console.log('🌱 Starting database seed check...');
    await seedDatabase(AppDataSource);
    console.log('✅ Seed check completed');
    
    // Close standalone connection (NestJS will create its own)
    await AppDataSource.destroy();
    console.log('✅ Standalone DataSource closed');
  } catch (error) {
    console.error('❌ STARTUP ERROR:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    // Continue anyway - server should still start
  }
  
  // Now create NestJS app
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
  
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Connected via DATABASE_URL' : 'Using individual DB vars'}`);
}

bootstrap();
