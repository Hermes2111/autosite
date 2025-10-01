import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchlistService } from './watchlist.service';
import { WatchlistController } from './watchlist.controller';
import { WatchlistItem } from './entities/watchlist-item.entity';
import { DiecastModel } from '../entities/diecast-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WatchlistItem, DiecastModel])],
  providers: [WatchlistService],
  controllers: [WatchlistController],
})
export class WatchlistModule {}
