import { NextRequest, NextResponse } from "next/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

// Anonymous client is only used for the *public* GET handler that lists
// reviews. All state-changing operations (POST) go through the server
// client which carries the caller's JWT, so RLS + reviewer_user_id
// policies actually enforce ownership.
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
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Cap review submissions to 5 / 15min / IP. Legitimate users only
    // ever review once per courier; anything higher is review-spam abuse.
    const limited = checkRateLimit(request, {
      bucket: "review-submit",
      max: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    // Require authentication — supabaseAuth carries the caller's JWT, so
    // all downstream reads/writes run under RLS with auth.uid() = user.id.
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

    // Check courier exists and is approved — courier_applications is
    // readable via anon RLS, so using supabaseAuth is fine and lets us
    // stay on the same client for every query.
    const { data: courier, error: courierErr } = await supabaseAuth
      .from("courier_applications")
      .select("id")
      .eq("id", id)
      .eq("status", "approved")
      .single();

    if (courierErr || !courier) {
      return NextResponse.json({ error: "Livreur introuvable" }, { status: 404 });
    }

    // Duplicate-check + insert both go through supabaseAuth so auth.uid()
    // is set. Previously this used an anon client, which meant any RLS
    // policy keyed on auth.uid() = reviewer_user_id would either reject
    // the insert or — worse — read 0 rows during the duplicate-check
    // because the anon role couldn't see the user's own prior review,
    // silently allowing repeat submissions.
    //
    // `courier_reviews` is not in the generated Database types yet (the
    // table post-dates the last `supabase gen types` run), so we cast to
    // any to work around the `never`-typed PostgrestFilterBuilder. Matches
    // the pattern used in the livreurs/[id] route and elsewhere.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authDb = supabaseAuth as any;

    const { data: existing, error: existingErr } = await authDb
      .from("courier_reviews")
      .select("id")
      .eq("courier_application_id", id)
      .eq("reviewer_user_id", user.id)
      .maybeSingle();

    if (existingErr) {
      console.error("Review duplicate-check error:", existingErr.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({ error: "Vous avez déjà laissé un avis pour ce livreur." }, { status: 409 });
    }

    const { data, error } = await authDb
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
