import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';

const app = express();

app.use(cors({ origin: JSON.parse(process.env.CORS_ORIGINS || '["*"]') }));
app.use(express.json());

function projectRoot(): string {
  return path.resolve(__dirname, '..', '..');
}

function csvPath(): string {
  const envPath = process.env.AUTOSITE_COLLECTION_CSV;
  if (envPath) return path.resolve(envPath);
  return path.join(projectRoot(), '..', 'collection.csv');
}

function normalizeColumnName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}

function loadCollection(): Array<Record<string, unknown>> {
  const file = csvPath();
  const raw = fs.readFileSync(file, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(l => l.length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',');
  const dataLines = lines.slice(1).filter(l => !l.startsWith(headers[0] + ','));
  const normHeaders = headers.map(normalizeColumnName);

  const records = dataLines.map(line => {
    const cols = line.split(',');
    const rec: Record<string, unknown> = {};
    for (let i = 0; i < normHeaders.length; i++) {
      rec[normHeaders[i]] = i < cols.length ? cols[i] : '';
    }
    return rec;
  });

  for (const rec of records) {
    const renames: Record<string, string> = {
      'shipping__fees_not_included!': 'shipping_fees_note',
      'afbeeldingen': 'images',
    };
    for (const [oldKey, newKey] of Object.entries(renames)) {
      if (oldKey in rec && !(newKey in rec)) {
        (rec as any)[newKey] = (rec as any)[oldKey];
        delete (rec as any)[oldKey];
      }
    }

    for (const key of ['year','what','scale','specs','numbers','price']) {
      if (!(key in rec)) (rec as any)[key] = '';
    }

    if ('images' in rec && typeof (rec as any)['images'] === 'string') {
      const val = ((rec as any)['images'] as string).trim();
      (rec as any)['images'] = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
    }
  }

  records.forEach((r, i) => (r as any).id = i);
  return records;
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/collection', (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.trim().toLowerCase();
  const limit = Math.min(Number(req.query.limit ?? 2000), 10000);
  const offset = Number(req.query.offset ?? 0);

  let items = loadCollection();

  if (q) {
    items = items.filter((rec: any) => [rec.year, rec.what, rec.specs, rec.numbers]
      .map((v: unknown) => String(v ?? '').toLowerCase())
      .some((v: string) => v.includes(q))
    );
  }

  const total = items.length;
  const window = items.slice(offset, offset + limit).map(r => ({
    id: Number((r as any).id) || 0,
    year: String((r as any).year || ''),
    what: String((r as any).what || ''),
    scale: String((r as any).scale || ''),
    specs: String((r as any).specs || ''),
    numbers: String((r as any).numbers || ''),
    price: String((r as any).price || ''),
    images: Array.isArray((r as any).images) ? (r as any).images : [],
  }));

  res.json({ total, count: window.length, items: window });
});

app.get('/collection/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const items = loadCollection();
  const found = items.find((r: any) => Number(r.id) === id);
  if (!found) return res.status(404).json({ detail: 'Item not found' });
  const payload = {
    id: Number((found as any).id) || 0,
    year: String((found as any).year || ''),
    what: String((found as any).what || ''),
    scale: String((found as any).scale || ''),
    specs: String((found as any).specs || ''),
    numbers: String((found as any).numbers || ''),
    price: String((found as any).price || ''),
    images: Array.isArray((found as any).images) ? (found as any).images : [],
  };
  res.json(payload);
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server listening on http://localhost:${PORT}`);
});


