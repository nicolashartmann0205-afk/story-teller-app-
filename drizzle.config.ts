import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";
import { getDatabaseConnectionUrl } from "./lib/db/connection-string";

// Load environment variables from .env.local and .env
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: getDatabaseConnectionUrl(),
  },
});
