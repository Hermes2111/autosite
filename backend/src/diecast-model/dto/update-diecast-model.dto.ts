import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateDiecastModelDto {
	@IsOptional()
	@IsString()
	year?: string;

	@IsOptional()
	@IsString()
	what?: string;

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

	@IsOptional()
	@IsBoolean()
	isSold?: boolean;

	@IsOptional()
	soldDate?: Date;

	@IsOptional()
	@IsString()
	soldPrice?: string;

	@IsOptional()
	@IsString()
	soldTo?: string;

	@IsOptional()
	@IsString()
	soldLocation?: string;

	@IsOptional()
	@IsString()
	shippingCost?: string;

	@IsOptional()
	@IsString()
	saleNotes?: string;

	@IsOptional()
	@IsString()
	salesChannel?: string;
}
