import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Parse DATABASE_URL manually for more control
const dbUrl = process.env.DATABASE_URL!;
const url = new URL(dbUrl);

const pool = new Pool({
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
