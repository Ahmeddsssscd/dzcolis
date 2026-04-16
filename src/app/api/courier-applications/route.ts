import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// GET — list all applications (for admin)
export async function GET() {
  const supabase = getSupabase();
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
    const { first_name, last_name, email, phone, wilaya, transport_type, message } = body;

    if (!first_name || !last_name || !email || !phone || !wilaya || !transport_type) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("courier_applications")
      .insert([{ first_name, last_name, email, phone, wilaya, transport_type, message, status: "pending" }])
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
