import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateDiecastModelDto {
	@IsString()
	year!: string;

	@IsString()
	what!: string;

	@IsOptional()
	@IsString()
	scale?: string;

	@IsOptional()
	@IsString()
	specs?: string;

	@IsOptional()
	@IsString()
	numbers?: string;

	@IsOptional()
	@IsString()
	price?: string;

	@IsOptional()
	teamId?: number;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	imageUrls?: string[];
}

