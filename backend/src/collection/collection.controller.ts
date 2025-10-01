import { Controller, Get, Param, Query } from '@nestjs/common';
import { CollectionService } from './collection.service';

@Controller('collection')
export class CollectionController {
	constructor(private readonly service: CollectionService) {}

	@Get()
	list(
		@Query('q') q?: string,
		@Query('limit') limit = '2000',
		@Query('offset') offset = '0',
	) {
		const items = this.service.loadAll();
		const needle = (q ?? '').toLowerCase().trim();

		let filtered = items;
		if (needle) {
			filtered = items.filter((rec: any) => [rec.year, rec.what, rec.specs, rec.numbers]
				.map((v: unknown) => String(v ?? '').toLowerCase())
				.some((v: string) => v.includes(needle))
			);
		}

		const lim = Math.min(parseInt(String(limit), 10) || 2000, 10000);
		const off = parseInt(String(offset), 10) || 0;

		const total = filtered.length;
		const window = filtered.slice(off, off + lim).map((r: any) => ({
			id: Number(r.id) || 0,
			year: String(r.year || ''),
			what: String(r.what || ''),
			scale: String(r.scale || ''),
			specs: String(r.specs || ''),
			numbers: String(r.numbers || ''),
			price: String(r.price || ''),
			images: Array.isArray(r.images) ? r.images : [],
		}));

		return { total, count: window.length, items: window };
	}

	@Get(':id')
	getOne(@Param('id') id: string) {
		const items = this.service.loadAll();
		const found = items.find((r: any) => Number(r.id) === Number(id));
		if (!found) return { statusCode: 404, message: 'Item not found' };
		return {
			id: Number(found.id) || 0,
			year: String(found.year || ''),
			what: String(found.what || ''),
			scale: String(found.scale || ''),
			specs: String(found.specs || ''),
			numbers: String(found.numbers || ''),
			price: String(found.price || ''),
			images: Array.isArray(found.images) ? found.images : [],
		};
	}
}


