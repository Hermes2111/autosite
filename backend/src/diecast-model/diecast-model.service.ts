import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiecastModel } from '../entities/diecast-model.entity';
import { CreateDiecastModelDto } from './dto/create-diecast-model.dto';
import { UpdateDiecastModelDto } from './dto/update-diecast-model.dto';

@Injectable()
export class DiecastModelService {
	constructor(
		@InjectRepository(DiecastModel) private readonly repo: Repository<DiecastModel>,
	) {}

	async findAll(): Promise<DiecastModel[]> {
		return this.repo.find();
	}

	async findOne(id: number): Promise<DiecastModel> {
		const item = await this.repo.findOne({ where: { id } });
		if (!item) throw new NotFoundException('DiecastModel not found');
		return item;
	}

	async create(dto: CreateDiecastModelDto): Promise<DiecastModel> {
		const entity = this.repo.create({
			...dto,
			imageUrls: dto.imageUrls ?? [],
		});
		return this.repo.save(entity);
	}

	async update(id: number, dto: UpdateDiecastModelDto): Promise<DiecastModel> {
		const item = await this.findOne(id);
		const updated = {
			...item,
			...dto,
		};
		if (dto.imageUrls !== undefined) {
			updated.imageUrls = dto.imageUrls;
		}
		return this.repo.save(updated);
	}

	async remove(id: number): Promise<void> {
		const r = await this.repo.delete(id);
		if (!r.affected) throw new NotFoundException('DiecastModel not found');
	}
}
