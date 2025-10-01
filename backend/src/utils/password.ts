import * as argon2 from 'argon2';

const HASH_LENGTH = Number(process.env.AUTH_ARGON_HASH_LENGTH ?? 32);
const TIME_COST = Number(process.env.AUTH_ARGON_TIME_COST ?? 6);
const MEMORY_COST = Number(process.env.AUTH_ARGON_MEMORY_COST ?? 2 ** 16);

export async function hashPassword(password: string): Promise<string> {
	return argon2.hash(password, {
		type: argon2.argon2id,
		hashLength: HASH_LENGTH,
		timeCost: TIME_COST,
		memoryCost: MEMORY_COST,
	});
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
	return argon2.verify(passwordHash, password);
}

