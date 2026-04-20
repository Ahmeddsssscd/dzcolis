import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

/**
 * Client-facing receipt PDF for a booking.
 *
 * Accessible to either party of the booking (sender OR listing owner)
 * via their own session. No admin cookie. We intentionally ship two
 * different PDFs for sender vs. transporter so the counterparty's
 * e-mail stays private to whoever is NOT that party.
 *
 * The document is a single-page "Reçu / Preuve de réservation":
 *  - header with ref + date
 *  - the user's own party block (full details)
 *  - the counterparty block (name + phone only — e-mail stripped)
 *  - route, parcel, amount, status
 *  - a short "What this proves" paragraph so a sender can print it
 *    and show it at a point-of-collection if they ever need to
 *
 * We do NOT include signature blocks here — the formal bon-de-livraison
 * with signatures is the admin-issued document at
 * `/api/admin/bookings/[id]/proof-pdf`. This route is meant for a user
 * who wants a record of what they paid for.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Load booking via admin client (RLS-independent); authorise below.
  const { data: booking, error: bErr } = await adminSupabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
  if (bErr || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const { data: listing } = await adminSupabase
    .from("listings")
    .select("*")
    .eq("id", booking.listing_id)
    .single();

  const isSender      = booking.sender_id === user.id;
  const isTransporter = listing?.user_id  === user.id;
  if (!isSender && !isTransporter) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: sender } = await adminSupabase
    .from("profiles")
    .select("first_name, last_name, phone, email")
    .eq("id", booking.sender_id)
    .single();

  let transporter: { first_name?: string; last_name?: string; phone?: string; email?: string } | null = null;
  if (listing?.user_id) {
    const { data: t } = await adminSupabase
      .from("profiles")
      .select("first_name, last_name, phone, email")
      .eq("id", listing.user_id)
      .single();
    transporter = t ?? null;
  }

  // Generate PDF into an in-memory buffer.
  const buffer: Buffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ─── Header ───────────────────────────────────────────────────
    doc.fillColor("#0f172a").fontSize(20).text("WASELLI", { continued: true })
       .fillColor("#16a34a").text("  ·  Reçu de réservation", { align: "left" });
    doc.moveDown(0.2);
    doc.fillColor("#64748b").fontSize(9).text(
      isSender
        ? "Document personnel de l'expéditeur — à conserver jusqu'à livraison"
        : "Document personnel du transporteur — à conserver pour vos archives"
    );
    doc.moveDown(1.5);

    // ─── Reference block ──────────────────────────────────────────
    doc.fillColor("#0f172a").fontSize(11).text("Référence", { continued: true })
       .fillColor("#16a34a").font("Helvetica-Bold").text(`   ${booking.booking_ref ?? booking.id}`);
    doc.font("Helvetica").fillColor("#64748b").fontSize(9).text(`Émis le ${new Date().toLocaleString("fr-FR")}`);
    doc.moveDown(1);

    // ─── Your party block (full contact) ─────────────────────────
    drawSection(doc, isSender ? "Vos informations (expéditeur)" : "Vos informations (transporteur)");
    const me = isSender ? sender : transporter;
    drawKV(doc, "Nom", `${me?.first_name ?? ""} ${me?.last_name ?? ""}`.trim() || "—");
    drawKV(doc, "Téléphone", me?.phone ?? "—");
    drawKV(doc, "E-mail", me?.email ?? "—");
    doc.moveDown(0.8);

    // ─── Counterparty block (name + phone only) ──────────────────
    drawSection(doc, isSender ? "Transporteur" : "Expéditeur");
    const other = isSender ? transporter : sender;
    drawKV(doc, "Nom", other ? `${other.first_name ?? ""} ${other.last_name ?? ""}`.trim() || "—" : "—");
    drawKV(doc, "Téléphone", other?.phone ?? "—");
    // E-mail of the counterparty is intentionally omitted — privacy.
    doc.moveDown(0.8);

    // ─── Route ───────────────────────────────────────────────────
    drawSection(doc, "Itinéraire");
    drawKV(doc, "Départ", listing?.from_city ?? "—");
    drawKV(doc, "Arrivée", listing?.to_city ?? "—");
    drawKV(doc, "Date prévue", listing?.departure_date ? formatDate(listing.departure_date) : "—");
    drawKV(doc, "International", listing?.is_international ? "Oui" : "Non");
    doc.moveDown(0.8);

    // ─── Parcel ─────────────────────────────────────────────────
    drawSection(doc, "Colis");
    drawKV(doc, "Contenu déclaré", booking.content ?? "—");
    drawKV(doc, "Poids", booking.weight != null ? `${booking.weight} kg` : "—");
    drawKV(doc, "Dimensions", booking.dimensions ?? "—");
    if (booking.instructions) drawKV(doc, "Instructions", booking.instructions);
    doc.moveDown(0.8);

    // ─── Recipient ──────────────────────────────────────────────
    drawSection(doc, "Destinataire");
    drawKV(doc, "Nom", booking.recipient_name ?? "—");
    drawKV(doc, "Téléphone", booking.recipient_phone ?? "—");
    if (booking.pickup_address) drawKV(doc, "Adresse de collecte", booking.pickup_address);
    doc.moveDown(0.8);

    // ─── Financial ──────────────────────────────────────────────
    drawSection(doc, "Règlement");
    drawKV(doc, "Montant", booking.total_amount != null ? `${Number(booking.total_amount).toLocaleString("fr-FR")} DA` : "—");
    drawKV(doc, "Statut paiement", mapPayment(booking.payment_status));
    drawKV(doc, "Statut expédition", mapStatus(booking.status));
    doc.moveDown(1);

    // ─── What this proves (short paragraph) ─────────────────────
    doc.font("Helvetica").fontSize(9).fillColor("#475569").text(
      isSender
        ? "Ce reçu atteste que votre réservation a bien été enregistrée par Waselli. " +
          "Les fonds restent sous séquestre jusqu'à la confirmation de livraison. " +
          "Pour le bon de livraison signé (preuve formelle pour les litiges), contactez le support."
        : "Ce reçu récapitule une réservation acceptée sur votre trajet. Conservez-le pour " +
          "vos archives. Le versement de votre rémunération est déclenché automatiquement " +
          "dès que l'expéditeur confirme la réception.",
      { align: "justify", lineGap: 2 }
    );

    // Footer
    doc.fontSize(8).fillColor("#94a3b8").text(
      `Généré automatiquement par Waselli · ${new Date().toLocaleString("fr-FR")} · ${booking.booking_ref ?? booking.id}`,
      50, doc.page.height - 60, { align: "center", width: doc.page.width - 100 }
    );

    doc.end();
  });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="waselli-recu-${booking.booking_ref ?? booking.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

// ─── Small PDF helpers ─────────────────────────────────────────────
function drawSection(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.2);
  doc.font("Helvetica-Bold").fillColor("#0f172a").fontSize(11).text(title.toUpperCase(), { characterSpacing: 1 });
  doc.strokeColor("#e2e8f0").lineWidth(0.6).moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke();
  doc.moveDown(0.5);
}

function drawKV(doc: PDFKit.PDFDocument, key: string, value: string) {
  const startY = doc.y;
  doc.font("Helvetica").fillColor("#64748b").fontSize(9).text(key, 50, startY, { width: 140 });
  doc.font("Helvetica").fillColor("#0f172a").fontSize(10).text(value, 200, startY, { width: 345 });
  doc.moveDown(0.15);
}

function mapStatus(s: string | null): string {
  switch (s) {
    case "pending":    return "En attente";
    case "accepted":   return "Confirmée";
    case "in_transit": return "En transit";
    case "delivered":  return "Livrée";
    case "cancelled":  return "Annulée";
    default:           return s ?? "—";
  }
}
function mapPayment(s: string | null): string {
  switch (s) {
    case "unpaid":   return "Non payé";
    case "pending":  return "En cours";
    case "paid":     return "Libéré au transporteur";
    case "refunded": return "Remboursé à l'expéditeur";
    default:         return s ?? "—";
  }
}
function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString("fr-FR"); } catch { return iso; }
}
