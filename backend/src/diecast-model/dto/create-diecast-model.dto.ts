import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

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
	customerId?: number;

	@IsOptional()
	@IsString()
	soldLocation?: string;

	@IsOptional()
	@IsString()
	shippingCost?: string;

	@IsOptional()
	@IsString()
	fees?: string;

	@IsOptional()
	@IsBoolean()
	isPaid?: boolean;

	@IsOptional()
	@IsString()
	saleNotes?: string;

	@IsOptional()
	@IsString()
	salesChannel?: string;
}

