import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminLoginForm from "./AdminLoginForm";

export const runtime = "nodejs";

/*
 * Login page — the one /admin/* route that doesn't require a session.
 *
 * If the visitor is ALREADY signed in, we bounce them back to /admin
 * so the login page isn't a surprise destination for a re-click on a
 * bookmark. This check is cheap (one DB row) and avoids the "why am I
 * at /admin/login when I'm clearly logged in" UX glitch.
 */
export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  return <AdminLoginForm />;
}
