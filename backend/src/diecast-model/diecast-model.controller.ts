import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { DiecastModelService } from './diecast-model.service';
import { CreateDiecastModelDto } from './dto/create-diecast-model.dto';
import { UpdateDiecastModelDto } from './dto/update-diecast-model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../constants/roles';
import { RolesRequired } from '../auth/roles.decorator';

@Controller('diecast-models')
export class DiecastModelController {
	constructor(private readonly service: DiecastModelService) {}

	@Get()
	async findAll() {
		const items = await this.service.findAll();
		return { items };
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.service.findOne(Number(id));
	}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@RolesRequired(Roles.ADMIN)
	create(@Body() dto: CreateDiecastModelDto) {
		return this.service.create(dto);
	}

	@Put(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@RolesRequired(Roles.ADMIN)
	update(@Param('id') id: string, @Body() dto: UpdateDiecastModelDto) {
		return this.service.update(Number(id), dto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@RolesRequired(Roles.ADMIN)
	remove(@Param('id') id: string) {
		return this.service.remove(Number(id));
	}
}

