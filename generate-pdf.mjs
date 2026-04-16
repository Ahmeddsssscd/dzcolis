import PDFDocument from "pdfkit";
import fs from "fs";

// ── Brand palette ──────────────────────────────────────────────────────────
const G       = "#00a651";   // DZColis green
const GD      = "#006233";   // dark green
const GL      = "#e8f5ee";   // light green tint
const DARK    = "#111827";
const MID     = "#374151";
const MUTED   = "#6b7280";
const PALE    = "#f9fafb";
const WHITE   = "#ffffff";
const BLUE    = "#2563eb";
const AMBER   = "#d97706";
const RED     = "#dc2626";
const PURPLE  = "#7c3aed";

const W = 595.28;
const H = 841.89;
const L = 48;   // left margin
const R = W - 48; // right edge

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  info: { Title: "DZColis — Dossier de presentation", Author: "Ammar & Khaled" },
});
doc.pipe(fs.createWriteStream("DZColis-Presentation.pdf"));

// ── Primitives ─────────────────────────────────────────────────────────────
const fill  = (x,y,w,h,c,r=0) => doc.roundedRect(x,y,w,h,r).fill(c);
const line  = (x1,y1,x2,y2,c,w=1) => doc.moveTo(x1,y1).lineTo(x2,y2).lineWidth(w).strokeColor(c).stroke();
const dot   = (x,y,r,c) => doc.circle(x,y,r).fill(c);
const sq    = (x,y,s,c,r=3) => doc.roundedRect(x,y,s,s,r).fill(c);

function card(x,y,w,h,bg=WHITE,radius=10) {
  fill(x+2, y+2, w, h, "#e5e7eb", radius);
  fill(x,   y,   w, h, bg,        radius);
}

function tag(x, y, text, bg, fg=WHITE) {
  const w = doc.fontSize(8).font("Helvetica").widthOfString(text) + 16;
  fill(x, y-3, w, 17, bg, 4);
  doc.fillColor(fg).text(text, x+8, y, { lineBreak:false });
  return w;
}

function hRule(y, c=GL) { fill(L, y, W-L*2, 2, c, 1); }

function footer(page, total) {
  fill(0, H-28, W, 28, GD);
  doc.fontSize(8).fillColor("#86efac").font("Helvetica")
     .text("DZColis — Dossier de presentation confidentiel", L, H-17);
  doc.fillColor("#86efac")
     .text(`${page} / ${total}`, W-60, H-17);
}

function sectionHeader(label, title, y) {
  doc.fontSize(8).fillColor(G).font("Helvetica").text(label.toUpperCase(), L, y);
  doc.fontSize(22).fillColor(DARK).font("Helvetica-Bold").text(title, L, y+14);
  fill(L, y+44, 36, 3, G, 2);
}

// ── Row of icon+title+desc ─────────────────────────────────────────────────
function row(iconColor, title, desc, x, y, maxW=220) {
  dot(x+8, y+8, 8, iconColor + "22");
  dot(x+8, y+8, 4, iconColor);
  doc.fontSize(9.5).fillColor(DARK).font("Helvetica-Bold").text(title, x+22, y+1, { lineBreak:false });
  doc.fontSize(8.5).fillColor(MUTED).font("Helvetica").text(desc, x+22, y+13, { width: maxW-22 });
}

// ── Check list item ────────────────────────────────────────────────────────
function check(text, x, y, color=G) {
  fill(x, y+2, 10, 10, color+"22", 2);
  doc.fontSize(7.5).fillColor(color).font("Helvetica-Bold").text("✓", x+2, y+2, { lineBreak:false });
  doc.fontSize(8.5).fillColor(MID).font("Helvetica").text(text, x+16, y+1, { lineBreak:false });
}

// ===================================================================
//  PAGE 1 — COVER
// ===================================================================

// Background gradient simulation
fill(0, 0,   W, 520, GD);
fill(0, 340, W, 200, G);  // lighter band
fill(0, 500, W, H-500, PALE);

// Geometric accents
doc.save();
doc.polygon([0,420],[W,360],[W,520],[0,520]).fill("#005a2b");
doc.restore();

// Dot grid texture
for (let gx = 0; gx < W; gx += 28)
  for (let gy = 0; gy < 520; gy += 28)
    dot(gx, gy, 0.7, "#ffffff10");

// Logo box
fill(L, 60, 52, 52, WHITE+"18", 10);
doc.fontSize(28).fillColor(WHITE).font("Helvetica-Bold").text("DZ", L+6, 72, {lineBreak:false});
doc.fontSize(10).fillColor("#86efac").font("Helvetica-Bold").text("COLIS", L+6, 103, {lineBreak:false});

// Headline
doc.fontSize(42).fillColor(WHITE).font("Helvetica-Bold")
   .text("La livraison\ncollaborative\nen Algerie.", L, 155, { width:460, lineBreak:true });

doc.fontSize(13).fillColor("#bbf7d0").font("Helvetica")
   .text("Connectez expediteurs et transporteurs — rapide, securise et economique.", L, 302, { width:420 });

// Pill tags
const pills = ["National · 48 wilayas", "Algerie  <->  Europe", "Paiement securise", "Temps reel"];
let px = L;
pills.forEach(p => {
  const pw = doc.fontSize(9).font("Helvetica").widthOfString(p) + 22;
  fill(px, 368, pw, 22, WHITE+"25", 11);
  doc.fillColor(WHITE).text(p, px+11, 373, { lineBreak:false });
  px += pw + 10;
  if (px > W - 100) px = L;
});

// KPI strip on white
const kpis = [["3", "types\nd'utilisateurs"], ["48", "wilayas\ncouvertes"], ["EUR + DA", "devises\nsupportees"], ["100 %", "securite\nhebergement"]];
let kx = L;
kpis.forEach(([n, l]) => {
  card(kx, 530, 116, 80, WHITE, 10);
  doc.fontSize(n.length > 3 ? 15 : 24).fillColor(G).font("Helvetica-Bold").text(n, kx+10, n.length>3 ? 553 : 546);
  doc.fontSize(8).fillColor(MUTED).font("Helvetica").text(l, kx+10, 572, { width:96 });
  kx += 126;
});

// Developed by + date
doc.fontSize(9).fillColor(MUTED).font("Helvetica")
   .text("Developpe par  Ammar & Khaled   ·   Avril 2026   ·   v1.0", L, H-55);
doc.fontSize(9).fillColor(G).text("dzcolis.vercel.app", R - doc.widthOfString("dzcolis.vercel.app") - 2, H-55);

footer(1, 7);

// ===================================================================
//  PAGE 2 — PLATFORM OVERVIEW
// ===================================================================
doc.addPage({ size:"A4", margins:{top:0,bottom:0,left:0,right:0} });
fill(0,0,W,H,PALE);
fill(0,0,W,6,G);

sectionHeader("Vue d'ensemble", "Qu'est-ce que DZColis ?", 32);

doc.fontSize(10.5).fillColor(MID).font("Helvetica")
   .text(
     "DZColis est une marketplace de co-transport : elle met en relation des personnes qui veulent envoyer des colis avec des transporteurs particuliers ou professionnels qui font deja le trajet. L'expediteur paie moins cher, le transporteur monetise son vehicule — tout le monde gagne.",
     L, 86, { width: W-L*2 }
   );

hRule(125);

// 3 user cards
const users = [
  { title:"Expediteur", color:BLUE, bg:"#eff6ff",
    pts:["Publie une annonce de colis","Recoit des offres de transporteurs","Paie en sequestre securise","Confirme la livraison pour liberer le paiement"] },
  { title:"Transporteur", color:G, bg:GL,
    pts:["Propose son trajet & disponibilite","Recoit et gere les reservations","Accepte ou refuse en un clic","Gagne jusqu'a 90 % du tarif annonce"] },
  { title:"Administrateur", color:AMBER, bg:"#fffbeb",
    pts:["Gere les utilisateurs & KYC","Supervise litiges et remboursements","Suit les paiements en temps reel","Configure la plateforme entiere"] },
];
let ux = L;
users.forEach(u => {
  card(ux, 138, 155, 200, u.bg, 10);
  fill(ux, 138, 155, 5, u.color, 2);
  doc.fontSize(11).fillColor(u.color).font("Helvetica-Bold").text(u.title, ux+12, 154);
  fill(ux+12, 168, doc.widthOfString(u.title)+2, 1.5, u.color);
  u.pts.forEach((p,i) => {
    check(p, ux+12, 180+i*24, u.color);
  });
  ux += 165;
});

hRule(362);

// 4-step flow
doc.fontSize(13).fillColor(DARK).font("Helvetica-Bold").text("Comment ca marche — 4 etapes", L, 374);

const steps = [
  ["01","Publiez","Decrivez votre colis,\ndepartement et date."],
  ["02","Recevez","Les transporteurs envoient\nleurs offres sur votre trajet."],
  ["03","Reservez","Choisissez, discutez et\nconfirmez la reservation."],
  ["04","Livraison","Paiement libere\naprès confirmation."],
];
let sx = L;
steps.forEach(([n,t,d], i) => {
  card(sx, 398, 116, 105, WHITE, 10);
  fill(sx, 398, 116, 5, G, 2);
  doc.fontSize(11).fillColor(G).font("Helvetica-Bold").text(n, sx+10, 412);
  doc.fontSize(9.5).fillColor(DARK).font("Helvetica-Bold").text(t, sx+10, 430);
  doc.fontSize(8.5).fillColor(MUTED).font("Helvetica").text(d, sx+10, 446, { width:96 });
  if (i < 3) {
    doc.moveTo(sx+118, 450).lineTo(sx+128, 450).lineWidth(1.5).dash(3,{space:2}).strokeColor(G).stroke().undash();
  }
  sx += 126;
});

footer(2, 7);

// ===================================================================
//  PAGE 3 — FEATURES
// ===================================================================
doc.addPage({ size:"A4", margins:{top:0,bottom:0,left:0,right:0} });
fill(0,0,W,H,PALE);
fill(0,0,W,6,G);

sectionHeader("Fonctionnalites", "Ce que la plateforme offre", 32);

// National column
card(L, 88, 232, 300, WHITE, 10);
fill(L, 88, 232, 5, G, 2);
doc.fontSize(11).fillColor(G).font("Helvetica-Bold").text("National", L+12, 104);
doc.fontSize(8.5).fillColor(MUTED).font("Helvetica").text("Algerie vers Algerie  ·  Tarif en DA", L+12, 119);
fill(L+12, 131, 200, 1, GL);

const natF = [
  [G,     "Annonces en temps reel",   "Publication instantanee, filtres ville & date"],
  [G,     "Messagerie integree",       "Chat direct entre expediteur et transporteur"],
  [G,     "Paiement sequestre",        "Fonds bloques jusqu'a confirmation de livraison"],
  [G,     "Suivi de colis",            "Statuts : en attente > accepte > en transit > livre"],
  [BLUE,  "Systeme d'avis",           "Notation des transporteurs et expediteurs"],
  [AMBER, "Programme parrainage",     "500 DA de bonus par filleul ayant une livraison"],
];
natF.forEach(([c,t,d],i) => row(c, t, d, L+12, 143+i*45, 220));

// International column
card(L+242, 88, 232, 300, WHITE, 10);
fill(L+242, 88, 232, 5, BLUE, 2);
doc.fontSize(11).fillColor(BLUE).font("Helvetica-Bold").text("International", L+254, 104);
doc.fontSize(8.5).fillColor(MUTED).font("Helvetica").text("Algerie <-> Europe  ·  Tarif en EUR", L+254, 119);
fill(L+254, 131, 200, 1, "#dbeafe");

const intlF = [
  [BLUE,   "Trajets Algerie-Europe",   "France, Espagne, Belgique, Allemagne, Italie..."],
  [BLUE,   "Devise EUR (euros)",        "Affichage et paiement en euros uniquement"],
  [PURPLE, "Stripe Checkout",          "Paiement CB international securise"],
  [G,      "Assurance 500 EUR",        "Couverture incluse sur chaque envoi"],
  [G,      "Suivi international",      "Page dediee avec historique douanier"],
  [AMBER,  "Devenir transporteur",     "Page dediee recrutement transporteurs EU"],
];
intlF.forEach(([c,t,d],i) => row(c, t, d, L+254, 143+i*45, 220));

hRule(415);

// Earnings simulator box
card(L, 428, W-L*2, 72, GL, 10);
fill(L, 428, W-L*2, 5, G, 2);
doc.fontSize(11).fillColor(GD).font("Helvetica-Bold").text("Simulateur de revenus transporteur (live)", L+14, 444);
doc.fontSize(9).fillColor(MUTED).font("Helvetica")
   .text("Sur la page /transporter, le transporteur entre sa capacite (kg) et son prix/kg — il voit ses revenus estimes en temps reel (90 % lui revient).", L+14, 461, { width: W-L*2-28 });

// Example calcs
const calcs = [["10 kg x 500 DA","= 4 500 DA"], ["25 kg x 400 DA","= 9 000 DA"], ["50 kg x 350 DA","= 15 750 DA"]];
let cx2 = L + 14;
calcs.forEach(([a,b]) => {
  card(cx2, 484, 148, 38, WHITE, 7);
  doc.fontSize(8.5).fillColor(MUTED).font("Helvetica").text(a, cx2+10, 493);
  doc.fontSize(9).fillColor(G).font("Helvetica-Bold").text(b, cx2+10, 505);
  cx2 += 158;
});

footer(3, 7);

// ===================================================================
//  PAGE 4 — SECURITY
// ===================================================================
doc.addPage({ size:"A4", margins:{top:0,bottom:0,left:0,right:0} });
fill(0,0,W,H,PALE);
fill(0,0,W,6,G);

sectionHeader("Securite & Confiance", "Ce qui protege les utilisateurs", 32);

const sec = [
  { title:"Authentification JWT", color:G, bg:GL,
    pts:["Auth Supabase avec tokens securises","Session persistante entre pages","Deconnexion propre sur tous appareils"] },
  { title:"Row Level Security (RLS)", color:BLUE, bg:"#eff6ff",
    pts:["Chaque user voit uniquement ses donnees","Conversations et reservations isolees","Regles PostgreSQL natives — inviolables"] },
  { title:"Verification KYC Admin", color:AMBER, bg:"#fffbeb",
    pts:["Identite verifiee avant activation compte","Documents stockes en securite (Supabase)","Validation manuelle par administrateur"] },
  { title:"Paiement Sequestre", color:PURPLE, bg:"#f5f3ff",
    pts:["Fonds bloques jusqu'a livraison confirmee","Remboursement integre en cas de litige","Stripe webhook signe — impossible a falsifier"] },
  { title:"API Routes Protegees", color:G, bg:GL,
    pts:["Toutes les routes /api/admin/ exigent role admin","Retour 401 si non authentifie, 403 si non admin","Transitions de statut des reservations validees"] },
  { title:"CSP & En-tetes HTTP", color:RED, bg:"#fef2f2",
    pts:["Content-Security-Policy strict dans vercel.json","X-Frame-Options, X-Content-Type-Options actifs","Domaines Stripe autorises, Skrill bloque"] },
];

let scol = 0, srow = 0;
sec.forEach((s, i) => {
  const sx2 = L + scol * 168;
  const sy  = 90  + srow * 178;
  card(sx2, sy, 156, 160, s.bg, 10);
  fill(sx2, sy, 156, 5, s.color, 2);
  doc.fontSize(10).fillColor(s.color).font("Helvetica-Bold").text(s.title, sx2+10, sy+16, { width:136 });
  fill(sx2+10, sy+36, 130, 1, s.color+"44");
  s.pts.forEach((p,pi) => check(p, sx2+10, sy+44+pi*32, s.color));
  scol++;
  if (scol >= 3) { scol = 0; srow++; }
});

// Litiges note
card(L, 450, W-L*2, 60, "#fef2f2", 10);
fill(L, 450, W-L*2, 5, RED, 2);
doc.fontSize(10).fillColor(RED).font("Helvetica-Bold").text("Gestion des litiges", L+14, 466);
doc.fontSize(9).fillColor(MUTED).font("Helvetica")
   .text("Systeme integre : l'administrateur peut ouvrir, traiter et resoudre chaque litige. Historique complet trace. Remboursement possible a tout moment depuis le dashboard admin.", L+14, 481, { width: W-L*2-28 });

footer(4, 7);

// ===================================================================
//  PAGE 5 — TECH STACK
// ===================================================================
doc.addPage({ size:"A4", margins:{top:0,bottom:0,left:0,right:0} });
fill(0,0,W,H,PALE);
fill(0,0,W,6,G);

sectionHeader("Architecture", "Stack technique", 32);

const techCols = [
  { title:"Frontend", color:BLUE, bg:"#eff6ff", items:[
    ["Next.js 16.2","App Router, SSR + SSG, TypeScript strict"],
    ["Tailwind CSS","Design system DZColis sur-mesure"],
    ["React Hooks","useState, useEffect, useCallback, useRef, Realtime"],
  ]},
  { title:"Backend & Auth", color:G, bg:GL, items:[
    ["Supabase","PostgreSQL + Auth JWT + Row Level Security"],
    ["API Routes","Serverless functions Vercel (Edge runtime)"],
    ["Realtime","Messagerie en direct via WebSocket Supabase"],
  ]},
  { title:"Paiements", color:PURPLE, bg:"#f5f3ff", items:[
    ["Stripe Checkout","Session securisee, redirect, retour auto"],
    ["Webhooks signes","Confirmation de paiement infalsifiable"],
    ["Sequestre logique","Liberation du paiement a la livraison"],
  ]},
  { title:"Deploiement", color:AMBER, bg:"#fffbeb", items:[
    ["Vercel","CI/CD auto a chaque push GitHub en ~30 s"],
    ["GitHub","Source control, historique, rollback instantane"],
    ["SSL + DNS","HTTPS automatique, domaine personnalise"],
  ]},
];

let tcx = L, tcy = 90;
techCols.forEach((tc, i) => {
  if (i === 2) { tcx = L; tcy = 300; }
  card(tcx, tcy, 232, 185, tc.bg, 10);
  fill(tcx, tcy, 232, 5, tc.color, 2);
  doc.fontSize(11).fillColor(tc.color).font("Helvetica-Bold").text(tc.title, tcx+12, tcy+16);
  tc.items.forEach(([t,d], ii) => {
    sq(tcx+12, tcy+38+ii*50, 8, tc.color, 2);
    doc.fontSize(9.5).fillColor(DARK).font("Helvetica-Bold").text(t, tcx+26, tcy+36+ii*50);
    doc.fontSize(8.5).fillColor(MUTED).font("Helvetica").text(d, tcx+26, tcy+50+ii*50, { width: 200 });
  });
  tcx += 242;
});

// Build stats
card(L, 503, W-L*2, 60, GL, 10);
fill(L, 503, W-L*2, 5, G, 2);
doc.fontSize(11).fillColor(GD).font("Helvetica-Bold").text("Build & Performance", L+14, 519);

const stats = ["63 routes generees","0 erreur TypeScript","Build en ~10 s","Deploiement en ~30 s","Supabase + Vercel = 0 serveur a gerer"];
let stx = L+14;
stats.forEach(s => {
  const sw = doc.fontSize(8.5).font("Helvetica").widthOfString(s) + 18;
  fill(stx, 534, sw, 18, GD, 4);
  doc.fillColor(WHITE).text(s, stx+9, 537, { lineBreak:false });
  stx += sw + 8;
});

footer(5, 7);

// ===================================================================
//  PAGE 6 — CODE ARCHITECTURE (VS Code dark style)
// ===================================================================
doc.addPage({ size:"A4", margins:{top:0,bottom:0,left:0,right:0} });
fill(0, 0, W, H, "#0f172a");

// Title bar
fill(0, 0, W, 36, "#1e293b");
doc.circle(18,18,5).fill("#ef4444");
doc.circle(32,18,5).fill("#f59e0b");
doc.circle(46,18,5).fill("#22c55e");
doc.fontSize(9).fillColor("#64748b").font("Helvetica")
   .text("dzcolis  —  Visual Studio Code", 0, 13, { align:"center", width:W });

// Sidebar
fill(0, 36, 185, H-36, "#1e293b");
doc.fontSize(7.5).fillColor("#475569").font("Helvetica").text("EXPLORATEUR", 12, 50);

const tree = [
  [0, "src/",                      "#94a3b8"],
  [1, "app/",                      "#94a3b8"],
  [2, "page.tsx",                  "#7dd3fc"],
  [2, "layout.tsx",                "#7dd3fc"],
  [2, "api/",                      "#94a3b8"],
  [3, "admin/stats/route.ts",      "#fde68a"],
  [3, "admin/users/route.ts",      "#fde68a"],
  [3, "messages/route.ts",         "#fde68a"],
  [3, "payment/stripe/route.ts",   "#fde68a"],
  [3, "bookings/update-status/",   "#fde68a"],
  [2, "tableau-de-bord/page.tsx",  "#7dd3fc"],
  [2, "annonces/[id]/page.tsx",    "#7dd3fc"],
  [2, "reserver/[listingId]/",     "#7dd3fc"],
  [2, "international/envoyer/",    "#7dd3fc"],
  [2, "admin/  (kyc,litiges...)",  "#7dd3fc"],
  [2, "messages/page.tsx",         "#7dd3fc"],
  [1, "lib/",                      "#94a3b8"],
  [2, "context.tsx",               "#c084fc"],
  [2, "supabase/client.ts",        "#c084fc"],
  [2, "supabase/server.ts",        "#c084fc"],
  [2, "supabase/admin.ts",         "#c084fc"],
  [2, "data.ts",                   "#7dd3fc"],
  [1, "components/",               "#94a3b8"],
  [2, "Header.tsx",                "#86efac"],
  [2, "Footer.tsx",                "#86efac"],
  [2, "WhatsAppButton.tsx",        "#86efac"],
  [2, "HeroSearch.tsx",            "#86efac"],
];
tree.forEach(([depth, name, color], i) => {
  const ty = 64 + i * 18;
  if (ty > H - 50) return;
  if (depth > 0) {
    doc.moveTo(12 + (depth-1)*10, ty+5)
       .lineTo(12 + depth*10, ty+5)
       .lineWidth(0.5).strokeColor("#334155").stroke();
  }
  doc.fontSize(8).fillColor(color).font("Helvetica")
     .text(name, 14 + depth*10, ty, { lineBreak:false });
});

// Editor area
fill(185, 36, W-185, H-36, "#0f172a");

// Tab bar
fill(185, 36, W-185, 28, "#1e293b");
fill(185, 36, 165,   28, "#0f172a");
doc.fontSize(8.5).fillColor("#94a3b8").font("Helvetica").text("route.ts  (api/admin)", 194, 48, {lineBreak:false});
doc.fillColor("#475569").text("context.tsx", 365, 48, {lineBreak:false});

// Code content
const lines = [
  ["// ── Admin API guard (all /api/admin/* routes) ──", "#64748b"],
  ["export async function GET() {",                     "#e2e8f0"],
  ["  const supabase = await createClient();",          "#7dd3fc"],
  ["  const { data: { user } }",                       "#e2e8f0"],
  ["    = await supabase.auth.getUser();",              "#7dd3fc"],
  ["  if (!user)",                                      "#e2e8f0"],
  ["    return NextResponse.json(",                     "#e2e8f0"],
  ['      { error: "Unauthorized" }, { status: 401 }', "#fca5a5"],
  ["    );",                                            "#e2e8f0"],
  ["  const { data: profile } =",                      "#e2e8f0"],
  ["    await (adminClient as any)",                    "#c084fc"],
  ['      .from("profiles").select("role")',            "#86efac"],
  ["      .eq(\"id\", user.id).single();",             "#86efac"],
  ['  if (profile?.role !== "admin")',                  "#e2e8f0"],
  ["    return NextResponse.json(",                     "#e2e8f0"],
  ['      { error: "Forbidden" }, { status: 403 }',   "#fca5a5"],
  ["    );",                                            "#e2e8f0"],
  ["",                                                  ""],
  ["// ── Booking state machine ─────────────────",     "#64748b"],
  ["const VALID_TRANSITIONS = {",                       "#e2e8f0"],
  ["  pending:    ['accepted', 'rejected'],",           "#86efac"],
  ["  accepted:   ['in_transit'],",                     "#86efac"],
  ["  in_transit: ['delivered'],",                      "#86efac"],
  ["  // Invalid transitions return HTTP 400",          "#64748b"],
  ["};",                                                "#e2e8f0"],
  ["",                                                  ""],
  ["// ── Auth race condition fix (all pages) ──",      "#64748b"],
  ["useEffect(() => {",                                 "#e2e8f0"],
  ["  if (authLoading) return;",                        "#fde68a"],
  ["  if (!user) router.push('/connexion');",           "#fca5a5"],
  ["}, [user, authLoading, router]);",                  "#e2e8f0"],
];
lines.forEach(([text, color], i) => {
  const ly = 76 + i * 17;
  if (ly > H - 45 || !text) return;
  // line number
  doc.fontSize(7.5).fillColor("#334155").font("Helvetica")
     .text(String(i+1).padStart(2," "), 190, ly, {lineBreak:false});
  doc.fontSize(8).fillColor(color).font("Helvetica")
     .text(text, 210, ly, {lineBreak:false});
});

// Status bar
fill(185, H-28, W-185, 28, "#1e293b");
const badges = ["main", "TypeScript", "Next.js 16", "0 errors", "Supabase + Vercel"];
let bx = 194;
badges.forEach(b => {
  const bw = doc.fontSize(7.5).widthOfString(b) + 12;
  fill(bx, H-20, bw, 13, "#0f172a", 3);
  doc.fillColor("#86efac").font("Helvetica").text(b, bx+6, H-18, {lineBreak:false});
  bx += bw + 6;
});

// ===================================================================
//  PAGE 7 — ROADMAP + CONTACT
// ===================================================================
doc.addPage({ size:"A4", margins:{top:0,bottom:0,left:0,right:0} });
fill(0,0,W,H,PALE);
fill(0,0,W,6,G);

sectionHeader("Roadmap & Contact", "Prochaines etapes", 32);

const phases = [
  { phase:"Phase 1", label:"Termine", color:G, bg:GL, items:[
    "Plateforme nationale complete",
    "Messagerie temps reel",
    "Paiement sequestre",
    "KYC & verification admin",
    "International Algerie-Europe",
    "Stripe integre",
    "Securite API renforcee",
    "Suivi de colis en direct",
  ]},
  { phase:"Phase 2", label:"A venir", color:AMBER, bg:"#fffbeb", items:[
    "Application mobile iOS & Android",
    "Notifications push",
    "Tracking GPS en temps reel",
    "Dashboard analytics transporteur",
    "API partenaires e-commerce",
    "Programme de fidelite avance",
  ]},
  { phase:"Phase 3", label:"Vision", color:PURPLE, bg:"#f5f3ff", items:[
    "Expansion Maghreb (Maroc, Tunisie)",
    "Tarification dynamique IA",
    "Automatisation declaration douanes",
    "Offre B2B entreprises",
    "Franchise DZColis",
  ]},
];

let phx = L;
phases.forEach(ph => {
  card(phx, 88, 156, 240, ph.bg, 10);
  fill(phx, 88, 156, 5, ph.color, 2);
  doc.fontSize(10).fillColor(ph.color).font("Helvetica-Bold").text(ph.phase, phx+12, 103);
  tag(phx+12, 118, ph.label, ph.color);
  fill(phx+12, 138, 130, 1, ph.color+"44");
  ph.items.forEach((it, ii) => {
    check(it, phx+12, 148+ii*24, ph.color);
  });
  phx += 166;
});

// Contact CTA card
fill(L, 358, W-L*2, 195, GD, 14);

doc.fontSize(20).fillColor(WHITE).font("Helvetica-Bold").text("Pret a lancer DZColis ?", L+22, 378);
doc.fontSize(10.5).fillColor("#bbf7d0").font("Helvetica")
   .text("La plateforme est operationnelle, securisee et deployee en production.\nIl ne manque que vos premiers utilisateurs.", L+22, 406, { width:400 });

hRule(440); // just a separator hint
fill(L+22, 442, W-L*2-44, 1, WHITE+"33");

doc.fontSize(10).fillColor(WHITE).font("Helvetica-Bold").text("Site web :", L+22, 456, {lineBreak:false});
doc.fontSize(10).fillColor("#86efac").font("Helvetica").text("  dzcolis.vercel.app", L+22+doc.widthOfString("Site web :"), 456, {lineBreak:false});

doc.fontSize(10).fillColor(WHITE).font("Helvetica-Bold").text("WhatsApp :", L+22, 476, {lineBreak:false});
doc.fillColor("#86efac").font("Helvetica").text("  +40 725 028 189", L+22+doc.widthOfString("WhatsApp :"), 476, {lineBreak:false});

doc.fontSize(10).fillColor(WHITE).font("Helvetica-Bold").text("Developpe par :", L+22, 496, {lineBreak:false});
doc.fillColor("#86efac").font("Helvetica").text("  Ammar & Khaled", L+22+doc.widthOfString("Developpe par :"), 496, {lineBreak:false});

// Final signature bar
fill(0, H-50, W, 50, "#064e3b");
doc.fontSize(9).fillColor("#6ee7b7").font("Helvetica")
   .text("DZColis  ·  Plateforme de livraison collaborative en Algerie  ·  Developpe par Ammar & Khaled  ·  Avril 2026", 0, H-32, { align:"center", width:W });

doc.end();
console.log("PDF generated: DZColis-Presentation.pdf");
