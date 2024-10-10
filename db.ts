import { createClient } from '@libsql/client';

require('dotenv').config();

if (!process.env.TURSO_DATABASE_URL) {
	throw new Error('TURSO_DATABASE_URL environment variable is not set');
}

export const turso = createClient({
	url: process.env.TURSO_DATABASE_URL,
	authToken: process.env.TURSO_AUTH_TOKEN,
});
