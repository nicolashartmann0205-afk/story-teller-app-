export const AUTH_ROUTES = {
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  GOOGLE: "/auth/google",
  CALLBACK: "/auth/callback",
} as const;
export const AUTH_ROUTE_PREFIX = "/auth";

export function isAuthRoute(pathname: string | null | undefined): boolean {
  return Boolean(pathname?.startsWith("/auth/"));
}

export function withRedirectedFrom(
  authRoute: string,
  redirectedFrom: string | null | undefined
): string {
  if (!redirectedFrom || isAuthRoute(redirectedFrom)) {
    return authRoute;
  }
  return `${authRoute}?redirectedFrom=${encodeURIComponent(redirectedFrom)}`;
}
