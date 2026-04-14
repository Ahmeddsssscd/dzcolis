import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/messages?conversation_id=xxx  → messages for a conversation
// GET /api/messages                       → all conversations for current user
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversationId = req.nextUrl.searchParams.get("conversation_id");

  if (conversationId) {
    // Return messages for this conversation (verify user is participant first)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conv } = await (supabase as any)
      .from("conversations")
      .select("id, sender_id, transporter_id")
      .eq("id", conversationId)
      .single();

    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (conv.sender_id !== user.id && conv.transporter_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: messages } = await (supabase as any)
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    return NextResponse.json(messages ?? []);
  }

  // Return all conversations for this user, enriched with other party's profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: convs } = await (supabase as any)
    .from("conversations")
    .select("*, listing:listings(from_city, to_city)")
    .or(`sender_id.eq.${user.id},transporter_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  if (!convs || convs.length === 0) return NextResponse.json([]);

  // Get the other participant's profile for each conversation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const otherIds = convs.map((c: any) => c.sender_id === user.id ? c.transporter_id : c.sender_id);
  const uniqueIds = [...new Set(otherIds)] as string[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", uniqueIds);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enriched = convs.map((c: any) => {
    const otherId = c.sender_id === user.id ? c.transporter_id : c.sender_id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const other = profileMap[otherId] as any;
    return {
      ...c,
      other_name: other ? `${other.first_name} ${other.last_name}`.trim() : "Utilisateur",
      other_id: otherId,
      route: c.listing ? `${c.listing.from_city} → ${c.listing.to_city}` : "Trajet",
    };
  });

  return NextResponse.json(enriched);
}

// POST /api/messages → send a message (creates conversation if needed)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversation_id, other_user_id, listing_id, text } = await req.json();

  if (!text?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  let convId = conversation_id;

  if (!convId) {
    // Create or find existing conversation
    if (!other_user_id || !listing_id) {
      return NextResponse.json({ error: "Missing other_user_id or listing_id" }, { status: 400 });
    }

    // Check if conversation already exists between these two for this listing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("conversations")
      .select("id")
      .eq("listing_id", listing_id)
      .or(
        `and(sender_id.eq.${user.id},transporter_id.eq.${other_user_id}),and(sender_id.eq.${other_user_id},transporter_id.eq.${user.id})`
      )
      .single();

    if (existing) {
      convId = existing.id;
    } else {
      // Get the listing to determine who is transporter
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: listing } = await (supabase as any)
        .from("listings")
        .select("user_id")
        .eq("id", listing_id)
        .single();

      const transporter_id = listing?.user_id === user.id ? user.id : other_user_id;
      const sender_id = listing?.user_id === user.id ? other_user_id : user.id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newConv } = await (supabase as any)
        .from("conversations")
        .insert({ listing_id, sender_id, transporter_id, last_message: text, last_message_at: new Date().toISOString() })
        .select()
        .single();

      convId = newConv?.id;
    }
  }

  if (!convId) return NextResponse.json({ error: "Could not create conversation" }, { status: 500 });

  // Insert message
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: message, error } = await (supabase as any)
    .from("messages")
    .insert({ conversation_id: convId, sender_id: user.id, text })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to send" }, { status: 500 });

  // Update last_message on conversation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("conversations")
    .update({ last_message: text, last_message_at: new Date().toISOString() })
    .eq("id", convId);

  return NextResponse.json({ message, conversation_id: convId });
}
