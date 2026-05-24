import { isRuntimeDatabaseConfigured } from "./runtime-env";

/** True when a real database URL is available at runtime (not build placeholder). */
export function isDatabaseConfigured(): boolean {
  return isRuntimeDatabaseConfigured();
}
