import { defineConfig } from "drizzle-kit";

// Use POOLING_DATABASE_URL if available, fallback to DATABASE_URL
const databaseUrl = process.env.POOLING_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "POOLING_DATABASE_URL or DATABASE_URL environment variable is not set"
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});

