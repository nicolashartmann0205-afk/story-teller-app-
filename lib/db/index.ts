import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getDatabaseUrl } from "@/lib/config/env";

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(getDatabaseUrl(), { 
  prepare: false,
  connect_timeout: 30,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});
export const db = drizzle(client, { schema });

