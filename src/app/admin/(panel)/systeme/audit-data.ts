/*
 * Snapshot of the 2026-04-20 "ultraview" audit. Rendered read-only in
 * /admin/systeme so every admin can see the same outstanding punch list
 * without having to grep the repo. Update this file after each sprint:
 *
 *   - change `status` to "fixed" (or "wontfix" if triaged away)
 *   - add new items discovered since
 *   - bump AUDIT_UPDATED_AT
 *
 * Status semantics:
 *   open    — known issue, not yet started
 *   wip     — someone has claimed it, code in flight
 *   fixed   — verified shipped, can be archived next update
 *   wontfix — triaged as acceptable or out of scope
 */

export const AUDIT_UPDATED_AT = "2026-04-20";

export type IssueSeverity = "critical" | "high" | "medium" | "low";
export type IssueStatus = "open" | "wip" | "fixed" | "wontfix";

export interface SecurityItem {
  id: string;
  severity: IssueSeverity;
  status: IssueStatus;
  title: string;
  where: string;
  note: string;
}

export const SECURITY_ITEMS: SecurityItem[] = [
  // ─── Critical ───
  {
    id: "C3", severity: "critical", status: "fixed",
    title: "Admin UI avait une garde client-side uniquement",
    where: "src/app/admin/layout.tsx",
    note: "Remplacé par un route group /admin/(panel) avec garde serveur via getAdminSession() avant tout rendu.",
  },
  {
    id: "C4", severity: "critical", status: "open",
    title: "Stripe /create ne recalcule pas le prix côté serveur",
    where: "src/app/api/payment/stripe/create/route.ts",
    note: "Trust client `amount`. Appliquer le même fix que Chargily (priceMatches + currency: 'eur').",
  },
  {
    id: "C5", severity: "critical", status: "open",
    title: "Skrill /create ne recalcule pas le prix",
    where: "src/app/api/payment/skrill/** (si existant)",
    note: "Même classe de bug que C4.",
  },

  // ─── High ───
  {
    id: "H3", severity: "high", status: "open",
    title: "Erreurs Postgrest/Chargily/Stripe renvoyées verbatim",
    where: "divers /api/*",
    note: "Remplacer error.message dans les réponses client par un message générique + log serveur complet.",
  },
  {
    id: "H5", severity: "high", status: "open",
    title: "Pas de MIME sniff sur les uploads (KYC, photos)",
    where: "src/app/api/upload/*",
    note: "Content-Type client est fait confiance. Ajouter une vérif magic-bytes serveur.",
  },
  {
    id: "H6", severity: "high", status: "open",
    title: "/api/messages POST sans rate-limit",
    where: "src/app/api/messages/route.ts",
    note: "Spam / flood possible. checkRateLimit({max:30, windowMs:60_000}).",
  },
  {
    id: "H7", severity: "high", status: "open",
    title: "/api/emails/** sans rate-limit",
    where: "src/app/api/emails/*",
    note: "Risque de relais mail sortant. Rate-limit agressif (5/15min).",
  },

  // ─── Medium ───
  {
    id: "M1", severity: "medium", status: "fixed",
    title: "Session admin non-révocable (token statique HMAC)",
    where: "src/lib/admin-auth.ts",
    note: "Cookie lié au uid + is_active re-vérifié à chaque requête. Désactiver un admin coupe sa session immédiatement.",
  },
  {
    id: "M2", severity: "medium", status: "open",
    title: "Impersonation de conversation",
    where: "src/app/api/messages/*",
    note: "L'expéditeur du message n'est pas vérifié comme participant de la conversation.",
  },
  {
    id: "M3", severity: "medium", status: "open",
    title: "/api/referral/** sans rate-limit",
    where: "src/app/api/referral/*",
    note: "Self-refer farming possible.",
  },
  {
    id: "M4", severity: "medium", status: "open",
    title: "Liste publique livreurs expose le téléphone",
    where: "src/app/api/livreurs/route.ts",
    note: "Scraping sans réservation. Masquer sauf listing_id scope.",
  },
  {
    id: "M5", severity: "medium", status: "open",
    title: "/api/profile expose kyc_status + wilaya",
    where: "src/app/api/profile/*",
    note: "Données visibles par tout utilisateur authentifié, pas seulement le propriétaire.",
  },
  {
    id: "M6", severity: "medium", status: "fixed",
    title: "Rate-limit réinitialisé au login réussi",
    where: "src/app/api/admin/login/route.ts",
    note: "resetRateLimit retiré au succès — credential stuffing ne peut plus débloquer le bucket.",
  },
  {
    id: "M7", severity: "medium", status: "open",
    title: "Skrill signature MD5 avec == (non constant-time)",
    where: "src/lib/skrill.ts (si existant)",
    note: "Utiliser crypto.timingSafeEqual sur les buffers.",
  },

  // ─── Low ───
  {
    id: "L1", severity: "low", status: "open",
    title: "L'expéditeur peut rejeter sa propre réservation",
    where: "src/app/api/bookings/[id]/reject/route.ts",
    note: "Doit être réservé au livreur.",
  },
  {
    id: "L2", severity: "low", status: "open",
    title: "Fallback http://localhost dans un url-builder",
    where: "src/lib/**",
    note: "Apparaîtrait dans les emails de prod si les envs ne sont pas set.",
  },
  {
    id: "L3", severity: "low", status: "wip",
    title: "/api/admin/users fait SELECT *",
    where: "src/app/api/admin/users/route.ts",
    note: "RBAC gate ajoutée, mais colonnes encore à pruner. Suite dans un sprint séparé.",
  },
];

export interface FeatureItem {
  id: string;
  title: string;
  status: "idea" | "wip" | "done" | "blocked";
  progress: number; // 0-100
  note: string;
}

export const FEATURE_ITEMS: FeatureItem[] = [
  { id: "F1",  title: "Flux réception colis côté expéditeur", status: "idea",    progress: 0,  note: "Branche morte dans /tableau-de-bord." },
  { id: "F2",  title: "Application du crédit de parrainage au checkout", status: "wip",     progress: 40, note: "Codes générés, mais crédit jamais appliqué au prix final." },
  { id: "F3",  title: "UX de re-soumission KYC après rejet", status: "idea",    progress: 0,  note: "Pas de CTA clair pour uploader à nouveau." },
  { id: "F4",  title: "Démarrage message depuis page annonce", status: "idea",    progress: 0,  note: "Bouton 'Contacter' ne pré-remplit pas la conversation." },
  { id: "F5",  title: "Traductions AR/EN dans /admin et toasts", status: "wip",     progress: 50, note: "~20 chaînes FR hard-codées." },
  { id: "F6",  title: "Templates emails (booking, KYC approved/rejected)", status: "wip",     progress: 30, note: "Placeholders actuellement." },
  { id: "F7",  title: "Dashboard gains livreurs", status: "idea",    progress: 10, note: "Carte UI présente, données zéros." },
  { id: "F8",  title: "Agrégation avg_rating stockée", status: "idea",    progress: 0,  note: "Recalculée à chaque requête, devrait être matérialisée." },
  { id: "F9",  title: "Suivi envois internationaux (API transporteur)", status: "idea",    progress: 5,  note: "UI stub, pas d'intégration carrier." },
  { id: "F10", title: "Flux litiges / remboursements", status: "wip",     progress: 20, note: "Résolution manuelle par notifications, besoin de schéma dédié." },
  { id: "F11", title: "Notifications push (service worker + VAPID)", status: "idea",    progress: 0,  note: "Référencé dans le code mais non configuré." },
  { id: "F12", title: "Autocomplete adresse wilaya/commune", status: "idea",    progress: 0,  note: "Dropdowns statiques." },
  { id: "F13", title: "Galerie photos livreur (multi)", status: "idea",    progress: 0,  note: "Schéma supporte l'array, UI mono-photo." },
  { id: "F14", title: "Fenêtre d'annulation de réservation", status: "idea",    progress: 0,  note: "Aucune politique imposée." },
];

export interface InfraItem {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  status: IssueStatus;
  note: string;
}

export const INFRA_ITEMS: InfraItem[] = [
  { id: "O1", severity: "high",   status: "open", title: "Migration 002_kyc_private_storage.sql appliquée en prod ?", note: "À exécuter via Supabase SQL Editor ou psql. Jusqu'à ce qu'elle passe, les scans CIN sont accessibles par URL publique." },
  { id: "O2", severity: "high",   status: "open", title: "STRIPE_WEBHOOK_SECRET configuré en prod ?", note: "Sinon les webhooks Stripe ne valident rien — les paiements EUR ne déclenchent pas la completion de booking." },
  { id: "O3", severity: "low",    status: "open", title: "Régénérer les types Supabase", note: "supabase gen types typescript — supprime les `as any` sur courier_reviews, admin_users, admin_audit_log." },
  { id: "O4", severity: "medium", status: "open", title: "Sentry / reporting d'erreurs", note: "Actuellement console.error uniquement. Ajouter Sentry pour capturer les 500 en prod." },
  { id: "O5", severity: "medium", status: "open", title: "Backups PITR Supabase activés ?", note: "À vérifier dans le dashboard Supabase, projet > settings > database > backups." },
  { id: "O6", severity: "low",    status: "open", title: "Analytics / funnel tracking", note: "Aucun, on ne peut pas mesurer le drop-off du funnel de réservation." },
];
