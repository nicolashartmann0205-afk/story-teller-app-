/** Auth, credits, and story data require cookies/DB at request time. */
export const dynamic = "force-dynamic";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
