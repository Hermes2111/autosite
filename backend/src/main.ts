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
  
  // Auto-seed database on startup (only if empty)
  try {
    const dataSource = app.get<DataSource>(getDataSourceToken());
    await seedDatabase(dataSource);
  } catch (error) {
    console.warn('⚠️  Could not auto-seed database:', error);
  }
  
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Connected via DATABASE_URL' : 'Using individual DB vars'}`);
}

bootstrap();
