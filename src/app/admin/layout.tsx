/*
 * Root /admin layout — intentionally a passthrough.
 *
 * The authenticated admin shell + server-side session guard live at
 * /admin/(panel)/layout.tsx, which wraps every admin page EXCEPT
 * /admin/login. The login page therefore bypasses the guard naturally
 * (it's not inside the route group) without risk of a redirect loop.
 */
export const runtime = "nodejs";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
