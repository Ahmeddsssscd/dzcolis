#!/usr/bin/env node
/**
 * Generates docs/WASELLI_REMISE_PROJET.pdf — the French handover
 * brochure for the client (Ammar & Yazid). Run with:
 *
 *   node scripts/generate-handover-pdf.mjs
 *
 * Self-contained: draws the W mark as vector paths so the PDF has no
 * raster dependency and scales cleanly on any screen or print.
 */

import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "..", "docs", "WASELLI_REMISE_PROJET.pdf");
mkdirSync(dirname(OUT_PATH), { recursive: true });

const BRAND = {
  green: "#16a34a",
  greenDark: "#15803d",
  ink: "#0f172a",
  muted: "#64748b",
  soft: "#94a3b8",
  line: "#e2e8f0",
  bg: "#f8fafc",
};

const doc = new PDFDocument({
  size: "A4",
  margin: 50,
  info: {
    Title: "Waselli — Remise de projet",
    Author: "Waselli",
    Subject: "Livraison du projet Waselli — pour Ammar & Yazid",
    Keywords: "waselli, remise, projet, ammar, yazid",
  },
});
doc.pipe(createWriteStream(OUT_PATH));

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const PAGE_W = doc.page.width;
const PAGE_H = doc.page.height;
const M = 50; // margin

/**
 * Draws the Waselli "W" mark as vector. Two-tone green. Transparent
 * background — no rounded square, just the W on whatever sits behind it.
 */
function drawLogo(x, y, size = 40) {
  const s = size / 40; // base size = 40
  doc.save();
  doc.translate(x, y);

  // W strokes — three V's with a flat top
  doc.fillColor(BRAND.green);
  doc.moveTo(0, 2 * s)
     .lineTo(6 * s, 2 * s)
     .lineTo(11 * s, 28 * s)
     .lineTo(16 * s, 8 * s)
     .lineTo(20 * s, 8 * s)
     .lineTo(25 * s, 28 * s)
     .lineTo(30 * s, 2 * s)
     .lineTo(36 * s, 2 * s)
     .lineTo(28 * s, 36 * s)
     .lineTo(22 * s, 36 * s)
     .lineTo(18 * s, 16 * s)
     .lineTo(14 * s, 36 * s)
     .lineTo(8 * s, 36 * s)
     .closePath()
     .fill();

  doc.restore();
}

function drawWordmark(x, y, fontSize = 22) {
  doc.fillColor(BRAND.ink).font("Helvetica-Bold").fontSize(fontSize)
     .text("Waselli", x, y, { lineBreak: false });
}

function pageFooter(pageLabel) {
  const y = PAGE_H - 40;
  doc.fillColor(BRAND.soft).font("Helvetica").fontSize(8)
     .text("Waselli · contact@waselli.com", M, y, { lineBreak: false });
  doc.text(pageLabel, PAGE_W - M - 100, y, { width: 100, align: "right", lineBreak: false });
}

function sectionTitle(title, { top = false } = {}) {
  if (top) doc.y = M + 40;
  doc.fillColor(BRAND.green).font("Helvetica-Bold").fontSize(11)
     .text(title.toUpperCase(), { characterSpacing: 1.5 });
  doc.moveDown(0.3);
  doc.strokeColor(BRAND.green).lineWidth(2)
     .moveTo(M, doc.y).lineTo(M + 40, doc.y).stroke();
  doc.moveDown(0.8);
}

function h2(text) {
  doc.fillColor(BRAND.ink).font("Helvetica-Bold").fontSize(18).text(text);
  doc.moveDown(0.6);
}

function body(text, opts = {}) {
  doc.fillColor(BRAND.ink).font("Helvetica").fontSize(10.5)
     .text(text, { align: "justify", lineGap: 3, ...opts });
  doc.moveDown(0.6);
}

function muted(text, opts = {}) {
  doc.fillColor(BRAND.muted).font("Helvetica").fontSize(9.5)
     .text(text, { align: "justify", lineGap: 2, ...opts });
  doc.moveDown(0.4);
}

function bullet(text) {
  const startY = doc.y;
  doc.fillColor(BRAND.green).font("Helvetica-Bold").fontSize(11)
     .text("•", M, startY, { lineBreak: false, width: 14 });
  doc.fillColor(BRAND.ink).font("Helvetica").fontSize(10.5)
     .text(text, M + 18, startY, { width: PAGE_W - 2 * M - 18, lineGap: 2 });
  doc.moveDown(0.25);
}

function kvRow(key, value) {
  const startY = doc.y;
  doc.fillColor(BRAND.muted).font("Helvetica").fontSize(9.5)
     .text(key, M, startY, { width: 180 });
  doc.fillColor(BRAND.ink).font("Helvetica-Bold").fontSize(10)
     .text(value, M + 200, startY, { width: PAGE_W - 2 * M - 200 });
  doc.moveDown(0.3);
}

function card(title, lines, { x = M, y, w = PAGE_W - 2 * M, h = 110 } = {}) {
  const cx = x, cy = y ?? doc.y;
  doc.roundedRect(cx, cy, w, h, 10)
     .fillAndStroke("#ffffff", BRAND.line);
  doc.fillColor(BRAND.ink).font("Helvetica-Bold").fontSize(11)
     .text(title, cx + 14, cy + 12, { width: w - 28 });
  doc.fillColor(BRAND.muted).font("Helvetica").fontSize(9)
     .text(lines.join("\n"), cx + 14, cy + 32, { width: w - 28, lineGap: 2 });
  doc.y = cy + h + 10;
}

function twoColCards(left, right) {
  const colW = (PAGE_W - 2 * M - 14) / 2;
  const startY = doc.y;
  doc.roundedRect(M, startY, colW, 115, 10).fillAndStroke("#ffffff", BRAND.line);
  doc.fillColor(BRAND.green).font("Helvetica-Bold").fontSize(11).text(left.title, M + 14, startY + 12, { width: colW - 28 });
  doc.fillColor(BRAND.ink).font("Helvetica").fontSize(9).text(left.body, M + 14, startY + 32, { width: colW - 28, lineGap: 2 });

  const rx = M + colW + 14;
  doc.roundedRect(rx, startY, colW, 115, 10).fillAndStroke("#ffffff", BRAND.line);
  doc.fillColor(BRAND.green).font("Helvetica-Bold").fontSize(11).text(right.title, rx + 14, startY + 12, { width: colW - 28 });
  doc.fillColor(BRAND.ink).font("Helvetica").fontSize(9).text(right.body, rx + 14, startY + 32, { width: colW - 28, lineGap: 2 });

  doc.y = startY + 115 + 12;
}

// ────────────────────────────────────────────────────────────
// PAGE 1 — Cover
// ────────────────────────────────────────────────────────────

// Subtle top band
doc.rect(0, 0, PAGE_W, 6).fill(BRAND.green);
doc.rect(0, 6, PAGE_W, 2).fill(BRAND.greenDark);

// Logo + wordmark, centered high
drawLogo(M, 90, 56);
drawWordmark(M + 80, 103, 30);

// Tagline under the wordmark
doc.fillColor(BRAND.muted).font("Helvetica").fontSize(11)
   .text("La marketplace algérienne de livraison entre particuliers", M, 150);

// Big title block
doc.y = 230;
doc.fillColor(BRAND.ink).font("Helvetica-Bold").fontSize(36)
   .text("Remise de projet", M, doc.y, { width: PAGE_W - 2 * M });
doc.moveDown(0.2);
doc.fillColor(BRAND.green).font("Helvetica-Bold").fontSize(22)
   .text("Plateforme Waselli", M, doc.y, { width: PAGE_W - 2 * M });
doc.moveDown(1.5);

// Client block
doc.fillColor(BRAND.muted).font("Helvetica").fontSize(10)
   .text("DESTINATAIRES", M, doc.y, { characterSpacing: 1.5 });
doc.moveDown(0.3);
doc.fillColor(BRAND.ink).font("Helvetica-Bold").fontSize(16)
   .text("Ammar  &  Yazid");
doc.moveDown(0.3);
doc.fillColor(BRAND.muted).font("Helvetica").fontSize(10)
   .text("Co-fondateurs · Waselli", { lineGap: 2 });

doc.moveDown(3);

// Key facts row
doc.moveDown(1);
const factY = doc.y;
const factW = (PAGE_W - 2 * M - 20) / 3;
function fact(x, bigLabel, smallLabel) {
  doc.roundedRect(x, factY, factW, 70, 10).fillAndStroke(BRAND.bg, BRAND.line);
  doc.fillColor(BRAND.green).font("Helvetica-Bold").fontSize(18)
     .text(bigLabel, x + 14, factY + 14, { width: factW - 28 });
  doc.fillColor(BRAND.muted).font("Helvetica").fontSize(9)
     .text(smallLabel, x + 14, factY + 40, { width: factW - 28, lineGap: 2 });
}
fact(M,                 "www.waselli.com",  "Domaine acquis · 200 €");
fact(M + factW + 10,    "FR · AR · EN",    "Site entièrement trilingue");
fact(M + 2 * factW + 20,"Livré",            "Prêt pour la mise en production");

// Date + contact block — bottom
const coverFooterY = PAGE_H - 150;
doc.fillColor(BRAND.muted).font("Helvetica").fontSize(9)
   .text("DATE DE REMISE", M, coverFooterY, { characterSpacing: 1.5 });
doc.fillColor(BRAND.ink).font("Helvetica-Bold").fontSize(12)
   .text("20 avril 2026", M, coverFooterY + 16);

doc.fillColor(BRAND.muted).font("Helvetica").fontSize(9)
   .text("CONTACT", M + 260, coverFooterY, { characterSpacing: 1.5 });
doc.fillColor(BRAND.ink).font("Helvetica-Bold").fontSize(12)
   .text("contact@waselli.com", M + 260, coverFooterY + 16);

// Bottom band
doc.rect(0, PAGE_H - 6, PAGE_W, 6).fill(BRAND.green);

// ────────────────────────────────────────────────────────────
// PAGE 2 — Message au client
// ────────────────────────────────────────────────────────────
doc.addPage();
drawLogo(M, M, 28);
drawWordmark(M + 40, M + 6, 16);

doc.y = M + 50;
sectionTitle("Message de remise");
h2("Le projet Waselli vous est officiellement livré.");

body(
  "Ammar, Yazid — ce document accompagne la remise complète de la plateforme Waselli. " +
  "Tout ce qui avait été convenu est en place : le site, les comptes utilisateurs, le tableau " +
  "de bord, la messagerie, les paiements, l'espace administrateur, le suivi des colis, " +
  "la partie internationale, les trois langues, et toutes les pages légales."
);

body(
  "Le nom de domaine www.waselli.com a été acheté et configuré (coût : 200 €). " +
  "Il pointe déjà vers la production. Les e-mails partent depuis une adresse au nom du domaine " +
  "(contact@waselli.com). L'infrastructure technique est prête pour recevoir vos premiers clients " +
  "dès maintenant."
);

body(
  "Ce PDF vous présente, étape par étape, ce qui a été construit, comment chaque élément " +
  "fonctionne, et les prochains pas que vous pouvez entreprendre. C'est volontairement sans " +
  "jargon technique — vous pourrez l'ouvrir en réunion avec un futur associé, un banquier ou " +
  "un partenaire sans avoir besoin d'un développeur à côté de vous."
);

doc.moveDown(0.5);
sectionTitle("En un coup d'œil");

twoColCards(
  {
    title: "Ce qui est fait",
    body:
      "• Site public multilingue (FR/AR/EN)\n" +
      "• Inscription et connexion (e-mail + Google)\n" +
      "• Publication d'annonces de trajets\n" +
      "• Réservation de colis avec paiement\n" +
      "• Messagerie entre expéditeur et transporteur\n" +
      "• Suivi public par référence\n" +
      "• Espace administrateur complet\n" +
      "• Pages légales (CGV, confidentialité, mentions)\n" +
      "• Déploiement en production",
  },
  {
    title: "Ce qui reste optionnel",
    body:
      "• Lancement publicitaire (Meta, Google, TikTok)\n" +
      "• Ajout de PayPal comme moyen de paiement\n" +
      "• Application mobile du côté livreur\n" +
      "• Suivi GPS temps réel\n" +
      "• Recrutement initial de 30 transporteurs\n" +
      "• Activation du mode Chargily « live »\n" +
      "• Analytique (Plausible ou PostHog)\n\n" +
      "Ces éléments sont documentés séparément.",
  },
);

pageFooter("Page 2 / 8");

// ────────────────────────────────────────────────────────────
// PAGE 3 — Le produit
// ────────────────────────────────────────────────────────────
doc.addPage();
drawLogo(M, M, 28);
drawWordmark(M + 40, M + 6, 16);
doc.y = M + 50;

sectionTitle("Le produit");
h2("Ce que Waselli permet de faire, aujourd'hui.");

body(
  "Waselli est une place de marché où les personnes qui voyagent entre deux villes (en Algérie " +
  "ou entre l'Algérie et l'Europe) peuvent proposer le coffre vide de leur voiture, leur place " +
  "bagage dans l'avion ou leur trajet en bus pour livrer les colis de particuliers. L'expéditeur " +
  "paie en ligne, Waselli garde l'argent en séquestre, et le transporteur n'est crédité qu'après " +
  "confirmation de livraison."
);

doc.moveDown(0.5);

card("1 — Le voyageur publie son trajet",
     [
       "Il indique le départ, l'arrivée, la date, le poids disponible et le prix.",
       "Son profil affiche sa note, le nombre d'avis, la photo du véhicule, et un badge vérifié",
       "si la pièce d'identité a été validée par un administrateur.",
     ],
     { h: 90 });

card("2 — L'expéditeur réserve et paie",
     [
       "Il choisit un trajet, décrit son colis, choisit une formule d'assurance (Essentielle,",
       "Standard ou Premium) et paie par carte Edahabia / CIB (Chargily) ou par carte",
       "internationale (Stripe). L'argent est gardé en séquestre.",
     ],
     { h: 100 });

card("3 — Le transporteur prend et livre",
     [
       "Les deux parties se coordonnent via la messagerie intégrée. Le transporteur marque",
       "« en transit », puis « livré ». L'expéditeur confirme la réception — et c'est à ce",
       "moment précis que les fonds sont libérés au transporteur.",
     ],
     { h: 100 });

card("4 — En cas de problème",
     [
       "Un bouton « ouvrir un litige » est disponible. Un administrateur tranche en moins de",
       "48 heures ouvrées sur la base des photos, des messages et du bon de livraison.",
       "Libération partielle, remboursement ou médiation : la décision est motivée.",
     ],
     { h: 100 });

pageFooter("Page 3 / 8");

// ────────────────────────────────────────────────────────────
// PAGE 4 — Fonctionnalités côté expéditeur
// ────────────────────────────────────────────────────────────
doc.addPage();
drawLogo(M, M, 28);
drawWordmark(M + 40, M + 6, 16);
doc.y = M + 50;

sectionTitle("Côté expéditeur");
h2("Ce que vit l'utilisateur qui envoie un colis.");

bullet("Accueil (/) : présentation du service, cycle de confiance, annuaire des transporteurs, routes internationales, section « Nos engagements », FAQ condensée.");
bullet("Envoi rapide (/envoyer) : formulaire en 3 étapes — colis, trajet, budget — avec un sélecteur de prix direct et un indicateur d'équité (trop bas / juste / généreux).");
bullet("Annuaire (/annonces) : liste filtrable par ville de départ, d'arrivée, type (national / international), poids disponible.");
bullet("Fiche annonce (/annonces/[id]) : détails du trajet, profil du transporteur, photos du véhicule, avis, bouton « réserver ».");
bullet("Réservation (/reserver/[id]) : résumé du colis, choix du moyen de paiement, confirmation, redirection vers Chargily ou Stripe.");
bullet("Confirmation : après paiement, redirection automatique vers « Discuter avec le transporteur » pour ouvrir la conversation de coordination.");
bullet("Suivi public (/suivi) : n'importe qui avec la référence WSL-26-XXXXXX peut voir la timeline de la livraison (en attente, accepté, en transit, livré).");
bullet("Tableau de bord (/tableau-de-bord) : liste de mes réservations, statut, bouton PDF pour le reçu, bouton d'avis quand la livraison est confirmée.");
bullet("Profil (/profil) : mes annonces publiées, mes statistiques, mes documents de vérification, paramètres.");
bullet("Messages (/messages) : toutes mes conversations avec les transporteurs, filtrable par annonce.");

pageFooter("Page 4 / 8");

// ────────────────────────────────────────────────────────────
// PAGE 5 — Fonctionnalités côté transporteur & admin
// ────────────────────────────────────────────────────────────
doc.addPage();
drawLogo(M, M, 28);
drawWordmark(M + 40, M + 6, 16);
doc.y = M + 50;

sectionTitle("Côté transporteur");
h2("Publier un trajet et gérer les demandes.");

bullet("Publier un trajet (/transporter) : ville de départ et d'arrivée (y compris villes de France et de la diaspora), date, poids disponible, prix.");
bullet("Mes réservations reçues : nouvelles demandes, en cours, livrées. Un bouton PDF sur chaque ligne pour télécharger le reçu.");
bullet("Coordination : bouton « marquer en route », puis « marquer livré ». La notification passe automatiquement à l'expéditeur.");
bullet("Paiement : une notification arrive quand l'expéditeur a payé — le transporteur sait que la réservation est « live » et peut préparer la collecte en toute sérénité.");
bullet("KYC : tant que les documents (pièce d'identité, permis, carte grise) ne sont pas approuvés, un bandeau jaune rappelle qu'il faut les téléverser.");

doc.moveDown(0.8);

sectionTitle("Côté administrateur");
h2("L'espace /admin vous appartient.");

bullet("Tableau de bord : statistiques globales (utilisateurs, annonces, réservations, revenus) + flux des événements à surveiller (nouveaux KYC, litiges, remboursements, colis à forte valeur).");
bullet("Expéditions : toutes les réservations avec un bouton « PDF » pour générer le bon de livraison signé (page 1 : détails, page 2 : déclaration et signatures).");
bullet("Livreurs : les candidatures de transporteurs avec bouton Approuver / Refuser.");
bullet("Litiges : les disputes ouvertes, avec boutons « rembourser » ou « libérer au transporteur ».");
bullet("Paramètres : e-mail de contact global, numéro WhatsApp, mode maintenance.");

pageFooter("Page 5 / 8");

// ────────────────────────────────────────────────────────────
// PAGE 6 — Ce qui vous protège
// ────────────────────────────────────────────────────────────
doc.addPage();
drawLogo(M, M, 28);
drawWordmark(M + 40, M + 6, 16);
doc.y = M + 50;

sectionTitle("Ce qui vous protège");
h2("Sécurité, paiements, conformité.");

body(
  "Waselli a été audité avant la remise. Toutes les failles critiques et hautes ont été corrigées. " +
  "Concrètement, voici ce que cela veut dire au quotidien :"
);

bullet("Séquestre réel : l'argent du client ne quitte jamais Waselli tant que la livraison n'est pas confirmée. Ce n'est pas une promesse marketing, c'est une logique dans la base de données et dans le webhook du prestataire de paiement.");
bullet("Espace admin protégé par mot de passe signé côté serveur (pas en clair dans le navigateur) et par un cookie sécurisé à durée limitée.");
bullet("Redirection d'authentification vérifiée : personne ne peut envoyer un lien Waselli qui redirige vers un site piégé après connexion.");
bullet("Upload de photos filtré sur l'identité de l'utilisateur connecté : personne ne peut remplacer la photo de profil d'un autre.");
bullet("Les API qui envoient des e-mails exigent une session valide : aucune personne extérieure ne peut faire parvenir des courriels depuis votre nom de domaine.");
bullet("En-têtes HTTP de sécurité en place (anti-clickjacking, anti-sniffing, HSTS).");

doc.moveDown(0.5);

sectionTitle("Paiements");

kvRow("Algérie (DZD)",           "Chargily Pay — cartes Edahabia et CIB");
kvRow("International (EUR)",     "Stripe (cartes Visa / Mastercard)");
kvRow("Commission plateforme",   "10 % incluse dans le prix affiché");
kvRow("Devise par défaut",       "Dinars algériens (DA)");
kvRow("Reçu client",             "PDF téléchargeable depuis le tableau de bord");
kvRow("Bon de livraison admin",  "PDF signé généré par l'espace administrateur");

doc.moveDown(0.4);
muted(
  "Astuce : au jour du lancement officiel, il suffit de basculer la variable CHARGILY_MODE " +
  "de « test » à « live » dans Vercel. C'est un changement d'une seconde."
);

pageFooter("Page 6 / 8");

// ────────────────────────────────────────────────────────────
// PAGE 7 — Livraison technique
// ────────────────────────────────────────────────────────────
doc.addPage();
drawLogo(M, M, 28);
drawWordmark(M + 40, M + 6, 16);
doc.y = M + 50;

sectionTitle("Livraison technique");
h2("Ce que vous récupérez concrètement.");

kvRow("Nom de domaine",           "www.waselli.com (acquis pour 200 €)");
kvRow("Hébergement",              "Vercel — dossier dzcolis");
kvRow("Base de données",          "Supabase — projet itbcazlejwattexuctur");
kvRow("E-mail transactionnel",    "Resend — à reconfigurer sur waselli.com");
kvRow("Paiements DZD",            "Chargily (compte à vous transférer)");
kvRow("Paiements EUR",            "Stripe (clés déjà en place)");
kvRow("Code source",              "Dépôt Git complet, commit par commit");
kvRow("Documentation",            "docs/WASELLI_HANDOFF.md (tout en détail)");
kvRow("Plan de marketing",        "docs/MARKETING_LAUNCH.md");
kvRow("Plan de la v2 livreur",    "docs/DELIVERY_IN_APP_PLAN.md");
kvRow("Audit forces/faiblesses",  "docs/RIGHT_WRONG_AUDIT.md");
kvRow("Audit des traductions",    "docs/TRANSLATION_AUDIT.md");
kvRow("Option PayPal",            "docs/PAYPAL_OPTION.md");

doc.moveDown(0.6);
sectionTitle("Accès à transférer");
muted(
  "Les accès suivants doivent être transférés à votre nom (instructions détaillées dans " +
  "le document WASELLI_HANDOFF.md). Comptez environ deux heures pour tout faire."
);
bullet("Nom de domaine waselli.com (registrar → à transférer vers votre compte).");
bullet("Compte Vercel (ou création d'une nouvelle organisation Vercel avec le même projet).");
bullet("Compte Supabase (transfert de propriétaire ou migration du projet).");
bullet("Compte Resend (création d'un compte à votre nom et re-configuration du domaine).");
bullet("Compte Chargily Pay en mode production (création avec votre identité d'entreprise).");
bullet("Compte Stripe pour les paiements internationaux.");

pageFooter("Page 7 / 8");

// ────────────────────────────────────────────────────────────
// PAGE 8 — Et maintenant ?
// ────────────────────────────────────────────────────────────
doc.addPage();
drawLogo(M, M, 28);
drawWordmark(M + 40, M + 6, 16);
doc.y = M + 50;

sectionTitle("Et maintenant ?");
h2("Les trois choses à faire dans les deux semaines.");

doc.moveDown(0.3);

card("1. Recrutement de 30 transporteurs",
     [
       "Avant toute dépense en publicité, il faut s'assurer qu'un expéditeur qui tombe sur",
       "le site trouve au moins un trajet disponible sur les corridors Alger-Oran,",
       "Alger-Constantine, Alger-Annaba, Alger-Paris, Alger-Marseille. Recrutement manuel,",
       "par WhatsApp et via les groupes Telegram. Budget : 0 €.",
     ],
     { h: 110 });

card("2. Bascule en production réelle",
     [
       "Faire tourner les clés Chargily de test vers les clés « live ». Configurer le domaine",
       "d'e-mails sur Resend pour envoyer depuis contact@waselli.com (au lieu de l'adresse",
       "par défaut). Tester une réservation de bout en bout avec de l'argent réel, entre deux",
       "comptes à vous. Budget : quelques euros de frais.",
     ],
     { h: 110 });

card("3. Premier lancement marketing",
     [
       "Suivre le plan détaillé dans docs/MARKETING_LAUNCH.md. Jour 0 un mardi, pas un",
       "week-end. Trois messages à tester en parallèle : le prix (5× moins cher), la confiance",
       "(humain vérifié) et la diaspora (pas la valise du cousin). Budget de lancement",
       "conseillé : 500 € sur 90 jours, répartis comme indiqué dans le plan.",
     ],
     { h: 110 });

doc.moveDown(1);

sectionTitle("Pour toute question");
doc.fillColor(BRAND.ink).font("Helvetica").fontSize(11)
   .text("Adresse e-mail de contact :", { continued: true });
doc.fillColor(BRAND.green).font("Helvetica-Bold")
   .text(" contact@waselli.com");
doc.moveDown(0.4);
doc.fillColor(BRAND.ink).font("Helvetica").fontSize(11)
   .text("Site web :", { continued: true });
doc.fillColor(BRAND.green).font("Helvetica-Bold")
   .text(" https://www.waselli.com");

doc.moveDown(2);
doc.fillColor(BRAND.muted).font("Helvetica-Oblique").fontSize(10)
   .text(
     "Bonne chance à vous deux. La plateforme est solide, les documents sont à jour, " +
     "le reste c'est la partie la plus excitante : rencontrer vos premiers clients.",
     { align: "center", lineGap: 3 }
   );
doc.moveDown(1);
doc.fillColor(BRAND.ink).font("Helvetica-Bold").fontSize(11)
   .text("— L'équipe Waselli", { align: "center" });

// Footer signature mark
doc.moveDown(2);
const sigY = doc.y;
drawLogo(PAGE_W / 2 - 16, sigY, 32);
drawWordmark(PAGE_W / 2 - 16 + 40, sigY + 6, 18);

pageFooter("Page 8 / 8");

doc.end();
console.log(`✔ PDF généré : ${OUT_PATH}`);
