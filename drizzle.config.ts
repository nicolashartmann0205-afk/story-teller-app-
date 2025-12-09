import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local and .env
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

// Read database URL directly for migrations (bypasses Supabase validation)
const databaseUrl = process.env.POOLING_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("POOLING_DATABASE_URL or DATABASE_URL is required");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});
