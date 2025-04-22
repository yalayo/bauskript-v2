import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.BAU_PGDATABASE || !process.env.BAU_PGHOST || !process.env.BAU_PGPORT || !process.env.BAU_PGUSER || !process.env.BAU_PGPASSWORD) {
  throw new Error(
    "PostgreSQL environment variables must be set: PGDATABASE, PGHOST, PGPORT, PGUSER, PGPASSWORD."
  );
}

export const pool = new Pool({
  database: process.env.BAU_PGDATABASE,
  host: process.env.BAU_PGHOST,
  port: Number(process.env.BAU_PGPORT),
  user: process.env.BAU_PGUSER,
  password: process.env.BAU_PGPASSWORD,
});

export const db = drizzle(pool, { schema });