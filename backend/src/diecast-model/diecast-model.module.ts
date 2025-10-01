import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiecastModel } from '../entities/diecast-model.entity';
import { ViewEvent } from '../entities/view-event.entity';
import { DiecastModelService } from './diecast-model.service';
import { DiecastModelController } from './diecast-model.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DiecastModel, ViewEvent])],
  controllers: [DiecastModelController],
  providers: [DiecastModelService],
  exports: [DiecastModelService],
})
export class DiecastModelModule {}
