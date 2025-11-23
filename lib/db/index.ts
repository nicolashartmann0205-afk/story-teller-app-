import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.POOLING_DATABASE_URL) {
  throw new Error("POOLING_DATABASE_URL environment variable is not set");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(process.env.POOLING_DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema });

