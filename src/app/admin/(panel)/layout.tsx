import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminShell from "../_components/AdminShell";

export const runtime = "nodejs";

/*
 * Server-side admin guard for everything under /admin/(panel)/*.
 *
 * Any unauthenticated visitor gets a 307 to /admin/login BEFORE a
 * single byte of dashboard HTML is rendered. This is what closes
 * security item C3 — there is no ghost-render window, no SSR leak,
 * no client-side check that flashes the UI while auth resolves.
 *
 * (Routes outside this group — /admin/login — do NOT hit this layout,
 *  so the guard can't ever loop.)
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      session={{
        userId: session.userId,
        email: session.email,
        fullName: session.fullName,
        role: session.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
