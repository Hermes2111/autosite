import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DiecastModelModule } from '../diecast-model/diecast-model.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { ensureDirSync } from '../utils/fs';
import { v4 as uuid } from 'uuid';
import { AuthModule } from '../auth/auth.module';
import { DiecastModel } from '../entities/diecast-model.entity';

const UPLOAD_PATH = join(process.cwd(), 'uploads', 'models');
ensureDirSync(UPLOAD_PATH);

@Module({
  imports: [
    DiecastModelModule,
    AuthModule,
    TypeOrmModule.forFeature([DiecastModel]),
    MulterModule.register({
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, UPLOAD_PATH),
        filename: (_req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          cb(null, `${uuid()}.${ext}`);
        },
      }),
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

