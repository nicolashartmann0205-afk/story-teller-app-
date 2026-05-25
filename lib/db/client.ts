import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseConnectionUrl } from "./connection-string";
import { isDatabaseConfigured } from "./is-configured";
import * as schema from "./schema";
import * as aiSchema from "./ai-schema";

const combinedSchema = { ...schema, ...aiSchema };
type Schema = typeof combinedSchema;
type Database = PostgresJsDatabase<Schema>;

const BUILD_PLACEHOLDER_HOST = "127.0.0.1:5432/build";

const globalForDb = globalThis as typeof globalThis & {
  __storyTellerDb?: Database;
  __storyTellerPg?: ReturnType<typeof postgres>;
  __storyTellerDbUrl?: string;
};

function assertRuntimeConnectionUrl(url: string): void {
  if (url.includes(BUILD_PLACEHOLDER_HOST)) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }
}

function closeCachedClient(): void {
  const client = globalForDb.__storyTellerPg;
  if (client) {
    void client.end({ timeout: 5 }).catch(() => undefined);
  }
  globalForDb.__storyTellerPg = undefined;
  globalForDb.__storyTellerDb = undefined;
  globalForDb.__storyTellerDbUrl = undefined;
}

function createDb(connectionString: string): Database {
  assertRuntimeConnectionUrl(connectionString);
  const client = postgres(connectionString, {
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  globalForDb.__storyTellerPg = client;
  globalForDb.__storyTellerDbUrl = connectionString;
  return drizzle(client, { schema: combinedSchema });
}

function getDbInstance(): Database {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const connectionString = getDatabaseConnectionUrl();
  assertRuntimeConnectionUrl(connectionString);

  if (globalForDb.__storyTellerDb && globalForDb.__storyTellerDbUrl === connectionString) {
    return globalForDb.__storyTellerDb;
  }

  closeCachedClient();
  globalForDb.__storyTellerDb = createDb(connectionString);
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
