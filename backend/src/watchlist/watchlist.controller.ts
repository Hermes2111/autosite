import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SessionUser } from '../auth/interfaces/session-user.interface';

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  getMine(@CurrentUser() user: SessionUser) {
    return this.watchlistService.getItemsForUser(user.userId);
  }

  @Post(':modelId')
  add(@CurrentUser() user: SessionUser, @Param('modelId') modelId: string) {
    return this.watchlistService.addToWatchlist(user.userId, Number(modelId));
  }

  @Delete(':modelId')
  remove(@CurrentUser() user: SessionUser, @Param('modelId') modelId: string) {
    return this.watchlistService.removeFromWatchlist(user.userId, Number(modelId));
  }

  @Delete()
  clear(@CurrentUser() user: SessionUser) {
    return this.watchlistService.clearWatchlist(user.userId);
  }
}
