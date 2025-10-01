export const JWT_AUDIENCE = process.env.AUTH_JWT_AUDIENCE ?? 'autosite.local';
export const JWT_ISSUER = process.env.AUTH_JWT_ISSUER ?? 'autosite.local';
export const JWT_EXPIRATION = Number(process.env.AUTH_JWT_EXPIRATION ?? 60 * 60);
export const JWT_SECRET = process.env.AUTH_JWT_SECRET ?? 'dev-secret-change-me';

export const PUBLIC_UPLOAD_BASE_URL = process.env.PUBLIC_UPLOAD_BASE_URL ?? 'http://localhost:3000/uploads';

