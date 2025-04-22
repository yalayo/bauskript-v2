import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    database: process.env.BAU_PGDATABASE,
    host: process.env.BAU_PGHOST,
    port: Number(process.env.BAU_PGPORT),
    user: process.env.BAU_PGUSER,
    password: process.env.BAU_PGPASSWORD,
    ssl: false,
  },
});
