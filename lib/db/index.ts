import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getDatabaseUrl } from "@/lib/config/env";

// Prevent multiple connections in development
const globalForDb = global as unknown as {
  conn: postgres.Sql | undefined;
};

const connectionString = getDatabaseUrl();

// Use existing connection if available, otherwise create new one
const client = globalForDb.conn ?? postgres(connectionString, { 
  prepare: false,
  // Explicit timeouts to prevent potential negative timeout calculations
  connect_timeout: 30,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

// Save connection to global object in development
if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });
