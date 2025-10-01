import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') ?? 3000);
  const cookieSecret = config.get('COOKIE_SECRET') ?? 'autosite-cookie-secret';
  app.use(cookieParser(cookieSecret));
  app.setGlobalPrefix('api');
  const uploadsDir = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads',
  });
  await app.listen(port);
}
bootstrap();


