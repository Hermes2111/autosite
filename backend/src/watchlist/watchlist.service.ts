import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchlistItem } from './entities/watchlist-item.entity';
import { DiecastModel } from '../entities/diecast-model.entity';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(WatchlistItem)
    private readonly repository: Repository<WatchlistItem>,
    @InjectRepository(DiecastModel)
    private readonly modelRepository: Repository<DiecastModel>,
  ) {}

  async getItemsForUser(userId: number) {
    const items = await this.repository.find({
      where: { userId },
      relations: ['model'],
      order: { createdAt: 'DESC' },
    });

    return items.map(item => ({
      id: item.id,
      model: item.model,
      createdAt: item.createdAt,
    }));
  }

  async addToWatchlist(userId: number, modelId: number) {
    const model = await this.modelRepository.findOne({ where: { id: modelId } });
    if (!model) {
      throw new NotFoundException('Model not found');
    }

    const existing = await this.repository.findOne({ where: { userId, modelId } });
    if (existing) return existing;

    const item = this.repository.create({ userId, modelId });
    return this.repository.save(item);
  }

  async removeFromWatchlist(userId: number, modelId: number) {
    await this.repository.delete({ userId, modelId });
  }

  async clearWatchlist(userId: number) {
    await this.repository.delete({ userId });
  }
}
