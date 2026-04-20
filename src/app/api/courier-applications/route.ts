import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { checkAdminCookie } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// GET — list all applications (admin only)
export async function GET() {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("courier_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data ?? []);
}

// POST — submit application
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { first_name, last_name, phone, wilaya, transport_type, message, price_range, contact_preference, zones, is_available, vehicle_photo_url } = body;

    // Require authentication — email always comes from the verified session, never from the form
    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Vous devez être connecté pour postuler." }, { status: 401 });
    }
    const email = user.email;

    if (!first_name || !last_name || !email || !phone || !wilaya || !transport_type) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Prevent duplicate applications for same email
    const { data: existing } = await supabase
      .from("courier_applications")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Vous avez déjà une candidature en cours." }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("courier_applications")
      .insert([{
        first_name, last_name, email, phone, wilaya, transport_type, message,
        price_range: price_range || null,
        contact_preference: contact_preference || null,
        zones: zones || null,
        is_available: is_available !== false,
        vehicle_photo_url: vehicle_photo_url || null,
        status: "pending",
      }])
      .select()
      .single();

    if (error) {
      console.error("Application insert error:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
