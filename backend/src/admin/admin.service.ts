import { Injectable } from '@nestjs/common';
import type { Express } from 'express';
import { DiecastModelService } from '../diecast-model/diecast-model.service';
import { CreateDiecastModelDto } from '../diecast-model/dto/create-diecast-model.dto';
import { UpdateDiecastModelDto } from '../diecast-model/dto/update-diecast-model.dto';
import { PUBLIC_UPLOAD_BASE_URL } from '../auth/constants';

const mapImages = (files: Express.Multer.File[]) => files.map(file => `${PUBLIC_UPLOAD_BASE_URL}/models/${file.filename}`);

@Injectable()
export class AdminService {
  constructor(private readonly diecastService: DiecastModelService) {}

  async createModelWithImages(dto: CreateDiecastModelDto, files: Express.Multer.File[]) {
    const imageUrls = mapImages(files);
    return this.diecastService.create({ ...dto, imageUrls });
  }

  async updateModelWithImages(id: number, dto: UpdateDiecastModelDto, files: Express.Multer.File[]) {
    await this.diecastService.findOne(id);

    const patch: UpdateDiecastModelDto = { ...dto };
    if (files.length) {
      patch.imageUrls = mapImages(files);
    }

    return this.diecastService.update(id, patch);
  }

  async deleteModel(id: number) {
    return this.diecastService.remove(id);
  }
}
