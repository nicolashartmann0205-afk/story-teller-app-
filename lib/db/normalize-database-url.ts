/**
 * Clean common paste mistakes from Supabase/Vercel env values.
 * Does not log or persist the URL — callers only use the return value at runtime.
 */
export function normalizeDatabaseUrl(raw: string | undefined): string | undefined {
  if (raw == null) {
    return undefined;
  }

  let url = raw.trim();
  if (!url) {
    return undefined;
  }

  // Vercel / .env.local sometimes include literal wrapping quotes.
  for (let i = 0; i < 2; i++) {
    if (
      (url.startsWith('"') && url.endsWith('"')) ||
      (url.startsWith("'") && url.endsWith("'"))
    ) {
      url = url.slice(1, -1).trim();
    }
  }

  // Strip UTF-8 BOM from bad handles.
  url = url.replace(/^\uFEFF/, "");

  if (!url) {
    return undefined;
  }

  return url;
}

export function isValidPostgresUrl(url: string): boolean {
  if (!/^postgres(ql)?:\/\//i.test(url)) {
    return false;
  }
  try {
    new URL(url.replace(/^postgres(ql)?:/, "http:"));
    return true;
  } catch {
    return false;
  }
}
