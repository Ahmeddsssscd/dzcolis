import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM_EMAIL ?? "Waselli <no-reply@waselli.com>";

/**
 * Escape user-provided strings before interpolating them into HTML email
 * templates. Without this, a sender could put `<script>` or a phishing link
 * in their first name / parcel content / city input and have it rendered
 * inside an email that arrives from our domain — effectively turning our
 * outbound email into a malware delivery channel.
 *
 * Covers the five characters that can break out of HTML text or attribute
 * context. Numbers are coerced to strings and pass through (they can't
 * inject markup, but we still pass them through the same helper for
 * consistency).
 */
function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// APP_URL is from our own env, not user input — safe to interpolate raw,
// but we run it through esc() too for defense in depth.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

// ── Email templates ─────────────────────────────────────────────────────

function baseHtml(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Waselli</title>
<style>
  body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:#f4f5f7; margin:0; padding:0; }
  .wrap { max-width:580px; margin:32px auto; background:#fff; border-radius:16px; overflow:hidden; }
  .header { background:#00a651; padding:24px 32px; }
  .header h1 { color:#fff; margin:0; font-size:22px; font-weight:700; letter-spacing:-0.3px; }
  .header p { color:#d4f5e3; margin:4px 0 0; font-size:13px; }
  .body { padding:32px; }
  .body p { color:#374151; font-size:15px; line-height:1.6; margin:0 0 16px; }
  .btn { display:inline-block; background:#00a651; color:#fff!important; text-decoration:none; padding:13px 28px; border-radius:10px; font-weight:600; font-size:15px; margin:8px 0 24px; }
  .card { background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:16px 20px; margin:16px 0; }
  .card p { margin:4px 0; font-size:14px; color:#6b7280; }
  .card strong { color:#111827; }
  .footer { background:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 32px; text-align:center; }
  .footer p { font-size:12px; color:#9ca3af; margin:0; }
  .ref { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px 16px; display:inline-block; font-size:20px; font-weight:700; color:#00a651; letter-spacing:1px; }
</style></head>
<body>
<div class="wrap">
  <div class="header"><h1>🟢 Waselli</h1><p>Livraison entre particuliers · Algérie</p></div>
  <div class="body">${content}</div>
  <div class="footer"><p>© ${new Date().getFullYear()} Waselli — Ne pas répondre à cet email</p></div>
</div>
</body></html>`;
}

// ── Send functions ───────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, firstName: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Bienvenue sur Waselli 🎉",
    html: baseHtml(`
      <p>Bonjour <strong>${esc(firstName)}</strong>,</p>
      <p>Bienvenue sur <strong>Waselli</strong> — la plateforme de livraison entre particuliers en Algérie !</p>
      <p>Votre compte est créé. Pour commencer :</p>
      <ul style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;">
        <li>Parcourez les <strong>annonces de transporteurs</strong> disponibles</li>
        <li>Vérifiez votre identité (KYC) pour proposer des trajets</li>
        <li>Envoyez votre premier colis en toute sécurité</li>
      </ul>
      <a href="${esc(APP_URL)}/annonces" class="btn">Voir les annonces →</a>
      <p>Des questions ? Consultez notre <a href="${esc(APP_URL)}/faq" style="color:#00a651;">FAQ</a>.</p>
    `),
  });
}

export async function sendBookingConfirmationEmail(to: string, data: {
  firstName: string;
  bookingRef: string;
  fromCity: string;
  toCity: string;
  departureDate: string;
  totalAmount: number;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Réservation confirmée — ${data.bookingRef}`,
    html: baseHtml(`
      <p>Bonjour <strong>${esc(data.firstName)}</strong>,</p>
      <p>Votre réservation a bien été enregistrée et votre paiement est sécurisé.</p>
      <div class="card">
        <p><strong>Référence :</strong> <span class="ref">${esc(data.bookingRef)}</span></p>
        <p style="margin-top:12px"><strong>Trajet :</strong> ${esc(data.fromCity)} → ${esc(data.toCity)}</p>
        <p><strong>Date :</strong> ${esc(new Date(data.departureDate).toLocaleDateString("fr-DZ", { day:"numeric", month:"long", year:"numeric" }))}</p>
        <p><strong>Total payé :</strong> ${esc(data.totalAmount.toLocaleString())} DA</p>
      </div>
      <p>Votre paiement est conservé en <strong>escrow sécurisé</strong> jusqu'à confirmation de réception par le destinataire.</p>
      <a href="${esc(APP_URL)}/tableau-de-bord" class="btn">Suivre ma réservation →</a>
    `),
  });
}

export async function sendPaymentConfirmedEmail(to: string, data: {
  firstName: string;
  bookingRef: string;
  amount: number;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Paiement confirmé — ${data.bookingRef}`,
    html: baseHtml(`
      <p>Bonjour <strong>${esc(data.firstName)}</strong>,</p>
      <p>Votre paiement a été confirmé avec succès ✅</p>
      <div class="card">
        <p><strong>Référence :</strong> ${esc(data.bookingRef)}</p>
        <p><strong>Montant :</strong> ${esc(data.amount.toLocaleString())} DA</p>
        <p><strong>Statut :</strong> <span style="color:#00a651;font-weight:600;">Payé et sécurisé</span></p>
      </div>
      <p>Le transporteur a été notifié et prendra contact avec vous pour organiser la collecte de votre colis.</p>
      <a href="${esc(APP_URL)}/tableau-de-bord" class="btn">Voir ma réservation →</a>
    `),
  });
}

export async function sendKycApprovedEmail(to: string, firstName: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Votre identité a été vérifiée ✅",
    html: baseHtml(`
      <p>Bonjour <strong>${esc(firstName)}</strong>,</p>
      <p>Bonne nouvelle ! Votre identité a été <strong>vérifiée avec succès</strong> par notre équipe.</p>
      <p>Vous pouvez maintenant :</p>
      <ul style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;">
        <li>Proposer des trajets en tant que transporteur</li>
        <li>Accéder aux formules d'assurance Standard et Premium</li>
        <li>Afficher le badge ✅ Vérifié sur votre profil</li>
      </ul>
      <a href="${esc(APP_URL)}/transporter" class="btn">Proposer un trajet →</a>
    `),
  });
}

export async function sendKycRejectedEmail(to: string, firstName: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Action requise — Vérification d'identité",
    html: baseHtml(`
      <p>Bonjour <strong>${esc(firstName)}</strong>,</p>
      <p>Nous n'avons pas pu valider vos documents de vérification d'identité.</p>
      <p>Raisons possibles :</p>
      <ul style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;">
        <li>Document flou ou illisible</li>
        <li>Document expiré</li>
        <li>Selfie ne montrant pas clairement le visage et la CIN</li>
      </ul>
      <p>Veuillez soumettre de nouveaux documents clairs et valides.</p>
      <a href="${esc(APP_URL)}/kyc" class="btn">Resoumettre mes documents →</a>
    `),
  });
}

export async function sendNewBookingToTransporterEmail(to: string, data: {
  transporterName: string;
  senderName: string;
  bookingRef: string;
  fromCity: string;
  toCity: string;
  weight: number;
  content: string;
  totalAmount: number;
  dashboardUrl: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `📦 Nouvelle réservation sur votre trajet — ${data.bookingRef}`,
    html: baseHtml(`
      <p>Bonjour <strong>${esc(data.transporterName)}</strong>,</p>
      <p>Vous avez reçu une <strong>nouvelle demande de livraison</strong> sur votre trajet !</p>
      <div class="card">
        <p><strong>Référence :</strong> <span class="ref">${esc(data.bookingRef)}</span></p>
        <p style="margin-top:12px"><strong>Trajet :</strong> ${esc(data.fromCity)} → ${esc(data.toCity)}</p>
        <p><strong>Expéditeur :</strong> ${esc(data.senderName)}</p>
        <p><strong>Contenu :</strong> ${esc(data.content)}</p>
        <p><strong>Poids :</strong> ${esc(data.weight)} kg</p>
        <p><strong>Montant :</strong> ${esc(data.totalAmount.toLocaleString())} DA</p>
      </div>
      <p>Connectez-vous à votre tableau de bord pour <strong>accepter ou refuser</strong> cette demande. Le paiement est déjà sécurisé.</p>
      <a href="${esc(data.dashboardUrl)}" class="btn">Voir la demande →</a>
      <p style="font-size:13px;color:#6b7280;">⏳ Répondez rapidement — les expéditeurs choisissent les transporteurs les plus réactifs.</p>
    `),
  });
}

export async function sendBookingAcceptedToSenderEmail(to: string, data: {
  senderName: string;
  bookingRef: string;
  fromCity: string;
  toCity: string;
  transporterName: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `✅ Votre réservation a été acceptée — ${data.bookingRef}`,
    html: baseHtml(`
      <p>Bonjour <strong>${esc(data.senderName)}</strong>,</p>
      <p>Bonne nouvelle ! Le transporteur <strong>${esc(data.transporterName)}</strong> a accepté votre demande.</p>
      <div class="card">
        <p><strong>Référence :</strong> <span class="ref">${esc(data.bookingRef)}</span></p>
        <p style="margin-top:12px"><strong>Trajet :</strong> ${esc(data.fromCity)} → ${esc(data.toCity)}</p>
        <p><strong>Statut :</strong> <span style="color:#00a651;font-weight:600;">✅ Accepté</span></p>
      </div>
      <p>Le transporteur va vous contacter pour organiser la récupération du colis. Votre paiement reste sécurisé jusqu'à livraison confirmée.</p>
      <a href="${esc(APP_URL)}/tableau-de-bord" class="btn">Suivre ma réservation →</a>
    `),
  });
}

export async function sendBookingInTransitEmail(to: string, data: {
  senderName: string;
  bookingRef: string;
  fromCity: string;
  toCity: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `🚗 Votre colis est en route — ${data.bookingRef}`,
    html: baseHtml(`
      <p>Bonjour <strong>${esc(data.senderName)}</strong>,</p>
      <p>Votre colis est maintenant <strong>en route</strong> vers sa destination !</p>
      <div class="card">
        <p><strong>Référence :</strong> <span class="ref">${esc(data.bookingRef)}</span></p>
        <p style="margin-top:12px"><strong>Trajet :</strong> ${esc(data.fromCity)} → ${esc(data.toCity)}</p>
        <p><strong>Statut :</strong> <span style="color:#7c3aed;font-weight:600;">🚗 En transit</span></p>
      </div>
      <p>Dès que votre colis est livré, pensez à <strong>confirmer la réception</strong> depuis votre tableau de bord pour libérer le paiement au transporteur.</p>
      <a href="${esc(APP_URL)}/tableau-de-bord" class="btn">Confirmer la réception →</a>
    `),
  });
}

export async function sendDeliveryConfirmedEmail(to: string, data: {
  firstName: string;
  bookingRef: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Colis livré — ${data.bookingRef}`,
    html: baseHtml(`
      <p>Bonjour <strong>${esc(data.firstName)}</strong>,</p>
      <p>Votre colis (réf. <strong>${esc(data.bookingRef)}</strong>) a été livré avec succès ! 📦</p>
      <p>Le paiement sera libéré au transporteur dans les prochaines heures.</p>
      <p>Pensez à <strong>évaluer votre transporteur</strong> pour aider la communauté Waselli.</p>
      <a href="${esc(APP_URL)}/tableau-de-bord" class="btn">Laisser un avis →</a>
    `),
  });
}

/**
 * Contact-form submissions from the public /contact page.
 *
 * Delivers the message to our support inbox (CONTACT_EMAIL, default
 * `contact@waselli.com`) with the submitter's email as `replyTo`, so a
 * support agent hitting Reply in any mail client lands on the sender —
 * not on our no-reply mailbox. We never set `from` to the submitter
 * (that would fail DMARC/SPF on our domain and bounce).
 */
export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const to = process.env.CONTACT_EMAIL ?? "contact@waselli.com";
  // Preserve line breaks from the textarea without giving raw HTML a path in.
  const messageHtml = esc(data.message).replace(/\n/g, "<br>");
  await resend.emails.send({
    from: FROM,
    to,
    replyTo: data.email,
    subject: `[Contact] ${data.subject} — ${data.name}`,
    html: baseHtml(`
      <p><strong>Nouveau message depuis le formulaire de contact</strong></p>
      <div class="card">
        <p><strong>Nom :</strong> ${esc(data.name)}</p>
        <p><strong>Email :</strong> ${esc(data.email)}</p>
        <p><strong>Sujet :</strong> ${esc(data.subject)}</p>
      </div>
      <p style="margin-top:16px;"><strong>Message :</strong></p>
      <div class="card" style="white-space:pre-wrap;">${messageHtml}</div>
      <p style="font-size:12px;color:#6b7280;margin-top:20px;">
        Répondez directement à cet email pour contacter l'expéditeur — le champ Reply-To est configuré sur
        <strong>${esc(data.email)}</strong>.
      </p>
    `),
  });
}

/**
 * Admin alert when a sender creates a booking. Carries the Bon de
 * livraison PDF as an attachment so ops can download/print it without
 * opening the admin panel.
 *
 * Goes to ADMIN_NOTIFICATION_EMAIL (falling back to ADMIN_EMAIL, then
 * to contact@waselli.com as a last resort) so the right people are
 * paged regardless of which env var convention is in use.
 */
export async function sendAdminNewBookingEmail(data: {
  bookingRef: string;
  fromCity: string;
  toCity: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  transporterName: string;
  transporterEmail: string;
  content: string;
  weight: number;
  totalAmount: number;
  recipientName: string;
  recipientPhone: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}) {
  const to =
    process.env.ADMIN_NOTIFICATION_EMAIL ??
    process.env.ADMIN_EMAIL ??
    "contact@waselli.com";

  await resend.emails.send({
    from: FROM,
    to,
    subject: `📬 Nouvelle réservation — ${data.bookingRef}`,
    html: baseHtml(`
      <p><strong>Une nouvelle réservation vient d'être créée.</strong> Le bon de livraison est en pièce jointe (à signer par l'expéditeur et le transporteur lors de la prise en charge).</p>
      <div class="card">
        <p><strong>Référence :</strong> <span class="ref">${esc(data.bookingRef)}</span></p>
        <p style="margin-top:12px"><strong>Trajet :</strong> ${esc(data.fromCity)} → ${esc(data.toCity)}</p>
        <p><strong>Expéditeur :</strong> ${esc(data.senderName)} · ${esc(data.senderEmail)} · ${esc(data.senderPhone)}</p>
        <p><strong>Transporteur :</strong> ${esc(data.transporterName)} · ${esc(data.transporterEmail)}</p>
        <p><strong>Destinataire :</strong> ${esc(data.recipientName)} · ${esc(data.recipientPhone)}</p>
        <p><strong>Contenu :</strong> ${esc(data.content)} (${esc(data.weight)} kg)</p>
        <p><strong>Montant :</strong> ${esc(data.totalAmount.toLocaleString())} DA</p>
      </div>
      <a href="${esc(APP_URL)}/admin/expeditions" class="btn">Ouvrir dans l'admin →</a>
    `),
    attachments: [
      {
        filename: data.pdfFilename,
        content: data.pdfBuffer,
      },
    ],
  });
}
