import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { requireAction } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Whitelist: vehicle_photo_url must point to our own Supabase Storage bucket.
 * Anything else (arbitrary domains, data: URIs, javascript: URIs) is rejected
 * so we never render attacker-controlled content on courier profile pages.
 */
function isValidVehiclePhotoUrl(url: unknown): url is string {
  if (typeof url !== "string" || url.length === 0) return false;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  const expectedPrefix = `${base}/storage/v1/object/public/vehicle-photos/`;
  return url.startsWith(expectedPrefix);
}

// GET — list all applications (admin only)
export async function GET() {
  const sessionOrRes = await requireAction("courier_applications.review");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
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
    // Max 5 new applications per IP per 15 min — stops spam applications from
    // bots or abusive users (a legitimate user only ever creates one).
    const limited = checkRateLimit(request, {
      bucket: "courier-apply",
      max: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const body = await request.json();
    const { first_name, last_name, phone, wilaya, transport_type, message, price_range, contact_preference, zones, is_available, vehicle_photo_url } = body;

    // Require authentication — email always comes from the verified session, never from the form
    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Vous devez être connecté pour postuler." }, { status: 401 });
    }

    // Require a confirmed email before letting someone publish a carrier
    // application. Otherwise a typo in the email locks them out forever
    // and unverified applicants end up in our admin queue — cost in
    // review time AND an SEO/trust problem if anyone browses carriers.
    //
    // Supabase sets `email_confirmed_at` when the user completes the
    // confirmation link. If it's missing, ask them to confirm first.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emailConfirmedAt = (user as any).email_confirmed_at ?? (user as any).confirmed_at;
    if (!emailConfirmedAt) {
      return NextResponse.json(
        {
          error:
            "Veuillez confirmer votre adresse e-mail avant de postuler. " +
            "Vérifiez votre boîte de réception (ou les spams) pour le lien de confirmation.",
        },
        { status: 403 }
      );
    }

    const email = user.email;

    if (!first_name || !last_name || !email || !phone || !wilaya || !transport_type) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    // Reject any vehicle_photo_url that isn't from our own Storage bucket.
    // Prevents attackers from saving phishing / SSRF / XSS URLs on profiles.
    if (vehicle_photo_url && !isValidVehiclePhotoUrl(vehicle_photo_url)) {
      return NextResponse.json(
        { error: "URL de photo véhicule invalide — utilisez le bouton d'upload." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Prevent duplicate applications for the same user (check user_id first,
    // fall back to email for rows that predate the user_id column).
    const { data: existing } = await supabase
      .from("courier_applications")
      .select("id")
      .or(`user_id.eq.${user.id},email.eq.${email}`)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Vous avez déjà une candidature en cours." }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("courier_applications")
      .insert([{
        user_id: user.id,
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
