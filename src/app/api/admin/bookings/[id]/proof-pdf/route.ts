import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

/**
 * Admin-only: returns a signed-proof PDF for a given booking.
 *
 * The document is a two-page "Bon de livraison / Preuve d'envoi":
 *  - Page 1: parties, route, parcel details, declared value, insurance
 *    tier, total paid. Meant to be printed and signed by both parties
 *    at pickup.
 *  - Page 2: legal declaration reprint + signature blocks (sender /
 *    transporter / admin witness) for dispute resolution.
 *
 * We don't store the PDF — it's regenerated from the DB on every
 * download so a status change (delivered, refunded...) is always
 * reflected.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const sessionOrRes = await requireAction("bookings.view");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Load booking + enriched data
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
    doc.fillColor("#0f172a").fontSize(20).text("WASELLI", { continued: true }).fillColor("#16a34a").text("  ·  Bon de livraison", { align: "left" });
    doc.moveDown(0.2);
    doc.fillColor("#64748b").fontSize(9).text("Document signé pour preuve d'envoi et de remise");
    doc.moveDown(1.5);

    // ─── Reference block ──────────────────────────────────────────
    doc.fillColor("#0f172a").fontSize(11).text("Référence", { continued: true }).fillColor("#16a34a").font("Helvetica-Bold").text(`   ${booking.booking_ref ?? booking.id}`);
    doc.font("Helvetica").fillColor("#64748b").fontSize(9).text(`Émis le ${new Date().toLocaleString("fr-FR")}`);
    doc.moveDown(1);

    // ─── Parties ─────────────────────────────────────────────────
    drawSection(doc, "Expéditeur");
    drawKV(doc, "Nom", `${sender?.first_name ?? ""} ${sender?.last_name ?? ""}`.trim() || "—");
    drawKV(doc, "Téléphone", sender?.phone ?? "—");
    drawKV(doc, "E-mail", sender?.email ?? "—");
    doc.moveDown(0.8);

    drawSection(doc, "Transporteur");
    drawKV(doc, "Nom", transporter ? `${transporter.first_name ?? ""} ${transporter.last_name ?? ""}`.trim() : "—");
    drawKV(doc, "Téléphone", transporter?.phone ?? "—");
    drawKV(doc, "E-mail", transporter?.email ?? "—");
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
    drawKV(doc, "Instructions", booking.instructions ?? "—");
    doc.moveDown(0.8);

    // ─── Recipient ──────────────────────────────────────────────
    drawSection(doc, "Destinataire");
    drawKV(doc, "Nom", booking.recipient_name ?? "—");
    drawKV(doc, "Téléphone", booking.recipient_phone ?? "—");
    drawKV(doc, "Adresse de collecte", booking.pickup_address ?? "—");
    doc.moveDown(0.8);

    // ─── Financial ──────────────────────────────────────────────
    drawSection(doc, "Règlement");
    drawKV(doc, "Montant total", booking.total_amount != null ? `${Number(booking.total_amount).toLocaleString("fr-FR")} DA` : "—");
    drawKV(doc, "Statut paiement", mapPayment(booking.payment_status));
    drawKV(doc, "Statut expédition", mapStatus(booking.status));
    drawKV(doc, "Commission plateforme", "10 % (incluse)");
    doc.moveDown(1);

    // ─── Page 2: Legal declaration ──────────────────────────────
    doc.addPage();
    doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(14).text("Déclaration sur l'honneur & signatures");
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(9).fillColor("#475569").text(
      "Le présent bon atteste de la prise en charge du colis décrit en page 1. L'expéditeur certifie l'exactitude " +
      "du contenu déclaré et s'engage à ne pas transporter d'article prohibé par la législation algérienne ou " +
      "celle du pays de destination (stupéfiants, armes, espèces non déclarées, matières dangereuses, produits " +
      "contrefaits, documents officiels d'un tiers, animaux vivants). Le transporteur s'engage à livrer le colis " +
      "intact dans les délais convenus.",
      { align: "justify", lineGap: 2 }
    );
    doc.moveDown(0.6);
    doc.text(
      "En cas de litige, les deux parties acceptent que Waselli examine ce document et les échanges internes " +
      "de la plateforme pour trancher la libération ou le remboursement des fonds mis sous séquestre.",
      { align: "justify", lineGap: 2 }
    );
    doc.moveDown(1.5);

    // Signature blocks
    drawSignatureBlock(doc, "Signature de l'expéditeur", 50);
    drawSignatureBlock(doc, "Signature du transporteur", 300);
    doc.moveDown(6);
    drawSignatureBlock(doc, "Visa Waselli (admin)", 50);

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
      "Content-Disposition": `attachment; filename="waselli-bon-${booking.booking_ref ?? booking.id}.pdf"`,
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

function drawSignatureBlock(doc: PDFKit.PDFDocument, label: string, x: number) {
  const y = doc.y;
  doc.font("Helvetica").fontSize(9).fillColor("#64748b").text(label, x, y);
  doc.strokeColor("#cbd5e1").lineWidth(0.8).moveTo(x, y + 50).lineTo(x + 200, y + 50).stroke();
  doc.font("Helvetica").fontSize(8).fillColor("#94a3b8").text("Signature & date", x, y + 54);
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
