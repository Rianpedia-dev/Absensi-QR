import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Pool } from "pg";

async function test() {
    console.log("Testing connection to:", process.env.DATABASE_URL);
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query("SELECT 1");
        console.log("Success!", res.rows);
    } catch (err) {
        console.error("Failed!", err);
    } finally {
        await pool.end();
    }
}

test();
