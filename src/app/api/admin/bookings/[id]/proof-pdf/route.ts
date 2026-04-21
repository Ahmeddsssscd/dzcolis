import { NextRequest, NextResponse } from "next/server";
import { requireAction } from "@/lib/admin-auth";
import { generateBookingProofPdf } from "@/lib/booking-pdf";

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
 * reflected. The generator lives in `src/lib/booking-pdf.ts` so the
 * same code runs whether the PDF is requested on demand by an admin
 * or auto-attached to the admin new-booking notification email.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const sessionOrRes = await requireAction("bookings.view");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const { buffer, filename } = await generateBookingProofPdf(id);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "PDF generation failed";
    const status = message.startsWith("Booking not found") ? 404 : 500;
    console.error("proof-pdf error:", e);
    return NextResponse.json({ error: message }, { status });
  }
}
