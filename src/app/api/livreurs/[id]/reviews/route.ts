import { NextResponse } from "next/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function getAnonSupabase() {
  return createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// GET /api/livreurs/[id]/reviews — list all reviews for a courier (public)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getAnonSupabase();

  const { data, error } = await supabase
    .from("courier_reviews")
    .select("id, reviewer_name, rating, comment, is_verified_user, created_at")
    .eq("courier_application_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Reviews fetch error:", error.message);
    return NextResponse.json([]);
  }
  return NextResponse.json(data ?? []);
}

// POST /api/livreurs/[id]/reviews — submit a review (requires auth)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Require authentication
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Vous devez être connecté pour laisser un avis." }, { status: 401 });
    }

    const body = await request.json();
    const { reviewer_name, rating, comment } = body;

    if (!reviewer_name?.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Note invalide (1–5)" }, { status: 400 });
    }

    // Check courier exists and is approved
    const supabase = getAnonSupabase();
    const { data: courier, error: courierErr } = await supabase
      .from("courier_applications")
      .select("id")
      .eq("id", id)
      .eq("status", "approved")
      .single();

    if (courierErr || !courier) {
      return NextResponse.json({ error: "Livreur introuvable" }, { status: 404 });
    }

    // Check the user hasn't already reviewed this courier
    const { data: existing } = await supabase
      .from("courier_reviews")
      .select("id")
      .eq("courier_application_id", id)
      .eq("reviewer_user_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Vous avez déjà laissé un avis pour ce livreur." }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("courier_reviews")
      .insert([{
        courier_application_id: id,
        reviewer_name: reviewer_name.trim(),
        reviewer_user_id: user.id,
        rating: Number(rating),
        comment: comment?.trim() || null,
        is_verified_user: true,
      }])
      .select()
      .single();

    if (error) {
      console.error("Review insert error:", error.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
