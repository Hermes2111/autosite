import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';

function csvPath() {
	const env = process.env.AUTOSITE_COLLECTION_CSV;
	if (env) return resolve(env);
	// backend/dist/collection -> up 3 levels to project root
	return join(__dirname, '..', '..', '..', 'collection.csv');
}

function normalize(name: string): string {
	return name.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}

@Injectable()
export class CollectionService {
	loadAll() {
		const file = csvPath();
		const raw = readFileSync(file, 'utf-8');
		const lines = raw.split(/\r?\n/).filter(l => l.length > 0);
		if (lines.length === 0) return [] as any[];

		const headers = lines[0].split(',');
		const data = lines.slice(1).filter(l => !l.startsWith(headers[0] + ','));
		const normHeaders = headers.map(normalize);

		const records = data.map(line => {
			const cols = line.split(',');
			const rec: Record<string, any> = {};
			for (let i = 0; i < normHeaders.length; i++) {
				rec[normHeaders[i]] = i < cols.length ? cols[i] : '';
			}
			return rec;
		});

		for (const rec of records) {
			if ('shipping__fees_not_included!' in rec && !('shipping_fees_note' in rec)) {
				rec['shipping_fees_note'] = rec['shipping__fees_not_included!'];
				delete rec['shipping__fees_not_included!'];
			}
			if ('afbeeldingen' in rec && !('images' in rec)) {
				rec['images'] = rec['afbeeldingen'];
				delete rec['afbeeldingen'];
			}

			for (const k of ['year','what','scale','specs','numbers','price']) {
				if (!(k in rec)) rec[k] = '';
			}

			if ('images' in rec && typeof rec['images'] === 'string') {
				const val = (rec['images'] as string).trim();
				rec['images'] = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
			}
		}

		records.forEach((r, i) => r.id = i);
		return records;
	}
}


