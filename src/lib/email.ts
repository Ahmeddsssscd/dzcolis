import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM_EMAIL ?? "DZColis <noreply@dzcolis.com>";

// ── Email templates ─────────────────────────────────────────────────────

function baseHtml(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>DZColis</title>
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
  <div class="header"><h1>🟢 DZColis</h1><p>Livraison entre particuliers · Algérie</p></div>
  <div class="body">${content}</div>
  <div class="footer"><p>© ${new Date().getFullYear()} DZColis — Ne pas répondre à cet email</p></div>
</div>
</body></html>`;
}

// ── Send functions ───────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, firstName: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Bienvenue sur DZColis 🎉",
    html: baseHtml(`
      <p>Bonjour <strong>${firstName}</strong>,</p>
      <p>Bienvenue sur <strong>DZColis</strong> — la plateforme de livraison entre particuliers en Algérie !</p>
      <p>Votre compte est créé. Pour commencer :</p>
      <ul style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;">
        <li>Parcourez les <strong>annonces de transporteurs</strong> disponibles</li>
        <li>Vérifiez votre identité (KYC) pour proposer des trajets</li>
        <li>Envoyez votre premier colis en toute sécurité</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/annonces" class="btn">Voir les annonces →</a>
      <p>Des questions ? Consultez notre <a href="${process.env.NEXT_PUBLIC_APP_URL}/faq" style="color:#00a651;">FAQ</a>.</p>
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
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Votre réservation a bien été enregistrée et votre paiement est sécurisé.</p>
      <div class="card">
        <p><strong>Référence :</strong> <span class="ref">${data.bookingRef}</span></p>
        <p style="margin-top:12px"><strong>Trajet :</strong> ${data.fromCity} → ${data.toCity}</p>
        <p><strong>Date :</strong> ${new Date(data.departureDate).toLocaleDateString("fr-DZ", { day:"numeric", month:"long", year:"numeric" })}</p>
        <p><strong>Total payé :</strong> ${data.totalAmount.toLocaleString()} DA</p>
      </div>
      <p>Votre paiement est conservé en <strong>escrow sécurisé</strong> jusqu'à confirmation de réception par le destinataire.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/tableau-de-bord" class="btn">Suivre ma réservation →</a>
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
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Votre paiement a été confirmé avec succès ✅</p>
      <div class="card">
        <p><strong>Référence :</strong> ${data.bookingRef}</p>
        <p><strong>Montant :</strong> ${data.amount.toLocaleString()} DA</p>
        <p><strong>Statut :</strong> <span style="color:#00a651;font-weight:600;">Payé et sécurisé</span></p>
      </div>
      <p>Le transporteur a été notifié et prendra contact avec vous pour organiser la collecte de votre colis.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/tableau-de-bord" class="btn">Voir ma réservation →</a>
    `),
  });
}

export async function sendKycApprovedEmail(to: string, firstName: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Votre identité a été vérifiée ✅",
    html: baseHtml(`
      <p>Bonjour <strong>${firstName}</strong>,</p>
      <p>Bonne nouvelle ! Votre identité a été <strong>vérifiée avec succès</strong> par notre équipe.</p>
      <p>Vous pouvez maintenant :</p>
      <ul style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;">
        <li>Proposer des trajets en tant que transporteur</li>
        <li>Accéder aux formules d'assurance Standard et Premium</li>
        <li>Afficher le badge ✅ Vérifié sur votre profil</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/transporter" class="btn">Proposer un trajet →</a>
    `),
  });
}

export async function sendKycRejectedEmail(to: string, firstName: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Action requise — Vérification d'identité",
    html: baseHtml(`
      <p>Bonjour <strong>${firstName}</strong>,</p>
      <p>Nous n'avons pas pu valider vos documents de vérification d'identité.</p>
      <p>Raisons possibles :</p>
      <ul style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;">
        <li>Document flou ou illisible</li>
        <li>Document expiré</li>
        <li>Selfie ne montrant pas clairement le visage et la CIN</li>
      </ul>
      <p>Veuillez soumettre de nouveaux documents clairs et valides.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/kyc" class="btn">Resoumettre mes documents →</a>
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
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Votre colis (réf. <strong>${data.bookingRef}</strong>) a été livré avec succès ! 📦</p>
      <p>Le paiement sera libéré au transporteur dans les prochaines heures.</p>
      <p>Pensez à <strong>évaluer votre transporteur</strong> pour aider la communauté DZColis.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/tableau-de-bord" class="btn">Laisser un avis →</a>
    `),
  });
}
