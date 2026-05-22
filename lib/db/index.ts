import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseConnectionUrl } from "./connection-string";
import * as schema from "./schema";
import * as aiSchema from "./ai-schema";

const combinedSchema = { ...schema, ...aiSchema };
type Schema = typeof combinedSchema;
type Database = PostgresJsDatabase<Schema>;

const globalForDb = globalThis as typeof globalThis & {
  __storyTellerDb?: Database;
  __storyTellerPg?: ReturnType<typeof postgres>;
};

function createDb(): Database {
  const connectionString = getDatabaseConnectionUrl();
  // Disable prefetch as it is not supported for "Transaction" pool mode
  const client = postgres(connectionString, { prepare: false });
  globalForDb.__storyTellerPg = client;
  return drizzle(client, { schema: combinedSchema });
}

function getDbInstance(): Database {
  if (!globalForDb.__storyTellerDb) {
    globalForDb.__storyTellerDb = createDb();
  }
  return globalForDb.__storyTellerDb;
}

/** Lazy DB client so Next.js build can import routes without DATABASE_URL at module load. */
export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const instance = getDbInstance();
    const value = Reflect.get(instance, prop, receiver) as unknown;
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(instance);
    }
    return value;
  },
});

export * from "./schema";
export * from "./ai-schema";
