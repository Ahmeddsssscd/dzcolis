import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";
import { formatPhone } from "@/lib/phone";
import PDFDocument from "pdfkit";

/**
 * POST /api/admin/couriers-pdf
 *   body: { ids: string[] }  (courier application IDs — the ones the
 *                             admin ticked in the list)
 *
 * Returns a single PDF ("Annuaire des transporteurs") the admin can
 * print or save. We intentionally build it on the server so the layout
 * stays consistent regardless of which browser is running the panel.
 *
 * Filtering (wilaya / vehicle / status) happens CLIENT-SIDE in the
 * livreurs page — the admin picks exactly which rows they want and
 * sends the list of ids here. This keeps the endpoint dead-simple and
 * avoids having to re-implement all the filter logic server-side.
 */
export const runtime = "nodejs";

interface AppRow {
  id: string;
  first_name: string | null;
  last_name:  string | null;
  email:      string | null;
  phone:      string | null;
  wilaya:     string | null;
  transport_type: string | null;
  status:     string | null;
  created_at: string | null;
}

const TRANSPORT_LABELS: Record<string, string> = {
  voiture:      "Voiture",
  moto:         "Moto",
  camionnette:  "Camionnette",
  camion:       "Camion",
  international:"International",
};

export async function POST(req: NextRequest) {
  const sessionOrRes = await requireAction("courier_applications.review");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const ids = Array.isArray((body as { ids?: unknown })?.ids)
    ? ((body as { ids: unknown[] }).ids.filter((x) => typeof x === "string") as string[])
    : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "Aucun transporteur sélectionné." }, { status: 400 });
  }
  if (ids.length > 500) {
    return NextResponse.json({ error: "Trop d'éléments (max 500)." }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminSupabase as any)
    .from("courier_applications")
    .select("id, first_name, last_name, email, phone, wilaya, transport_type, status, created_at")
    .in("id", ids)
    .order("wilaya", { ascending: true })
    .order("last_name", { ascending: true });
  if (error) {
    console.error("couriers-pdf query failed:", error);
    return NextResponse.json({ error: "Chargement impossible" }, { status: 500 });
  }
  const rows: AppRow[] = (data ?? []) as AppRow[];

  const buffer: Buffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    /* Header */
    doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(20).text("WASELLI", { continued: true });
    doc.fillColor("#16a34a").text("  ·  Annuaire des transporteurs");
    doc.moveDown(0.2);
    doc.font("Helvetica").fillColor("#64748b").fontSize(9).text(
      `Généré le ${new Date().toLocaleString("fr-FR")} — ${rows.length} transporteur(s)`
    );
    doc.moveDown(1);

    if (rows.length === 0) {
      doc.fillColor("#475569").fontSize(12).text("Aucun transporteur à afficher.");
      doc.end();
      return;
    }

    /* Table header */
    const COLS = [
      { label: "Nom",       width: 130 },
      { label: "Téléphone", width: 120 },
      { label: "Wilaya",    width: 100 },
      { label: "Véhicule",  width: 85  },
      { label: "Statut",    width: 60  },
    ];
    const startX = 50;
    let y = doc.y;

    function drawHeader() {
      doc.save();
      doc.rect(startX, y, COLS.reduce((s, c) => s + c.width, 0), 22).fill("#0f172a");
      doc.restore();
      let x = startX + 6;
      doc.fillColor("#f8fafc").font("Helvetica-Bold").fontSize(10);
      for (const c of COLS) {
        doc.text(c.label, x, y + 6, { width: c.width - 12 });
        x += c.width;
      }
      y += 24;
      doc.font("Helvetica").fillColor("#0f172a").fontSize(10);
    }

    drawHeader();

    let currentWilaya = "";
    for (const r of rows) {
      // Page-break if we're running out of space. 720 ≈ bottom margin.
      if (y > 760) {
        doc.addPage();
        y = 50;
        drawHeader();
      }

      // Wilaya group header (visual separator — optional but nice).
      const wil = r.wilaya ?? "—";
      if (wil !== currentWilaya) {
        currentWilaya = wil;
        doc.save();
        doc.rect(startX, y, COLS.reduce((s, c) => s + c.width, 0), 18).fill("#f1f5f9");
        doc.restore();
        doc.fillColor("#334155").font("Helvetica-Bold").fontSize(10)
           .text(`📍 ${wil}`, startX + 6, y + 4);
        y += 20;
        doc.font("Helvetica").fillColor("#0f172a");
      }

      const rowH = 20;
      let x = startX + 6;
      const name  = `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || "—";
      const phone = formatPhone(r.phone) || "—";
      const veh   = r.transport_type ? (TRANSPORT_LABELS[r.transport_type] ?? r.transport_type) : "—";
      const stat  = r.status === "approved" ? "Approuvé"
                  : r.status === "rejected" ? "Refusé"
                  : "En attente";

      const values = [name, phone, wil, veh, stat];
      for (let i = 0; i < COLS.length; i++) {
        doc.text(values[i], x, y + 4, { width: COLS[i].width - 12, ellipsis: true });
        x += COLS[i].width;
      }
      // Row border
      doc.save();
      doc.strokeColor("#e2e8f0").lineWidth(0.5)
         .moveTo(startX, y + rowH).lineTo(startX + COLS.reduce((s, c) => s + c.width, 0), y + rowH).stroke();
      doc.restore();
      y += rowH;
    }

    /* Footer */
    doc.fontSize(8).fillColor("#94a3b8").text(
      `Généré automatiquement par Waselli · ${new Date().toLocaleString("fr-FR")}`,
      50, doc.page.height - 40, { align: "center", width: doc.page.width - 100 }
    );

    doc.end();
  });

  const filename = `waselli-transporteurs-${new Date().toISOString().slice(0, 10)}.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
