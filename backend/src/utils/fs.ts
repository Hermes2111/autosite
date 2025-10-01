import { existsSync, mkdirSync } from 'fs';

export function ensureDirSync(dir: string) {
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
}

