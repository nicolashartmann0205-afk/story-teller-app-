const DEFAULT_NEXT = "/dashboard";

/** Allows only same-origin relative paths; blocks open redirects. */
export function safeRelativeNextPath(next: string | null | undefined): string {
  if (!next || typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_NEXT;
  }
  return next;
}
