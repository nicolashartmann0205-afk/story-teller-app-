import type { AuthError } from "@supabase/supabase-js";

/** User-facing copy when Supabase rejects weak or leaked passwords. */
export function formatPasswordAuthError(error: AuthError | null): string | null {
  if (!error) return null;

  const code = (error as AuthError & { code?: string }).code ?? "";
  const message = error.message ?? "";

  if (
    code === "weak_password" ||
    /known to have been compromised|found in data breaches|pwned|leaked password/i.test(
      message
    )
  ) {
    return "That password has appeared in a known data breach. Choose a different password, ideally from a password manager.";
  }

  if (/password.*at least|minimum.*characters|too short/i.test(message)) {
    return message;
  }

  return message || "Could not set password. Please try again.";
}
