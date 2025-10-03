import { Body, Controller, Delete, Param, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { CreateDiecastModelDto } from '../diecast-model/dto/create-diecast-model.dto';
import { UpdateDiecastModelDto } from '../diecast-model/dto/update-diecast-model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../constants/roles';
import { RolesRequired } from '../auth/roles.decorator';
import type { Express } from 'express';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Post('models')
	@RolesRequired(Roles.ADMIN)
	@UseInterceptors(FilesInterceptor('images', 10))
	createModel(
		@Body() body: CreateDiecastModelDto,
		@UploadedFiles() files: Express.Multer.File[],
	) {
		return this.adminService.createModelWithImages(body, files ?? []);
	}

	@Patch('models/:id')
	@RolesRequired(Roles.ADMIN)
	@UseInterceptors(FilesInterceptor('images', 10))
	updateModel(
		@Param('id') id: string,
		@Body() body: UpdateDiecastModelDto,
		@UploadedFiles() files: Express.Multer.File[],
	) {
		return this.adminService.updateModelWithImages(Number(id), body, files ?? []);
	}

	@Delete('models/:id')
	@RolesRequired(Roles.ADMIN)
	deleteModel(@Param('id') id: string) {
		return this.adminService.deleteModel(Number(id));
	}
}
