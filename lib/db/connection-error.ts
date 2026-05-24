export function isDatabaseNotConfiguredError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("database_not_configured") ||
    message.includes("pooling_database_url") ||
    message.includes("database_url is required")
  );
}

export function dashboardDataLoadWarning(
  error: unknown,
  options?: { isOwner?: boolean }
): string {
  if (isDatabaseNotConfiguredError(error)) {
    const base =
      "Your stories and credits are stored safely, but the live site cannot reach the database yet.";
    if (options?.isOwner) {
      return `${base} In Vercel → Settings → Environment Variables, set POOLING_DATABASE_URL (run pnpm db:copy-env-vercel pooling locally to copy the value), then redeploy Production.`;
    }
    return `${base} Please try again in a few minutes.`;
  }

  return "We could not load your story stats right now. You can still create stories.";
}
