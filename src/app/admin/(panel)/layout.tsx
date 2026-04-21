import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminShell from "../_components/AdminShell";

export const runtime = "nodejs";

// Unauthenticated requests are redirected to /admin/login before any HTML renders.
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
