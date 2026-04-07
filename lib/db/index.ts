import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseConnectionUrl } from "./connection-string";
import * as schema from "./schema";
import * as aiSchema from "./ai-schema";

const connectionString = getDatabaseConnectionUrl();

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema: { ...schema, ...aiSchema } });

export * from "./schema";
export * from "./ai-schema";
