import PDFDocument from "pdfkit";
import fs from "fs";

const doc = new PDFDocument({ size: "A4", margin: 50 });
doc.pipe(fs.createWriteStream("../DZColis-Proposition.pdf"));

const GREEN = "#006233";
const DARK = "#1a2420";
const GRAY = "#6b8573";
const LIGHT_BG = "#f0f4f1";
const RED = "#d21034";

function heading(text, size = 22) {
  doc.moveDown(0.5);
  doc.fontSize(size).fillColor(GREEN).font("Helvetica-Bold").text(text);
  doc.moveDown(0.3);
  doc.strokeColor(GREEN).lineWidth(2).moveTo(50, doc.y).lineTo(250, doc.y).stroke();
  doc.moveDown(0.5);
}

function subheading(text) {
  doc.moveDown(0.3);
  doc.fontSize(13).fillColor(DARK).font("Helvetica-Bold").text(text);
  doc.moveDown(0.3);
}

function body(text) {
  doc.fontSize(10).fillColor(DARK).font("Helvetica").text(text, { lineGap: 4 });
}

function bullet(text) {
  doc.fontSize(10).fillColor(DARK).font("Helvetica").text(`  •  ${text}`, { lineGap: 3 });
}

function tableRow(col1, col2, bold = false) {
  const y = doc.y;
  const font = bold ? "Helvetica-Bold" : "Helvetica";
  const color = bold ? GREEN : DARK;
  doc.fontSize(10).font(font).fillColor(color).text(col1, 60, y, { width: 220, continued: false });
  doc.fontSize(10).font("Helvetica").fillColor(DARK).text(col2, 290, y, { width: 250 });
  doc.moveDown(0.2);
}

function tableHeader(col1, col2) {
  const y = doc.y;
  doc.rect(50, y - 3, 500, 20).fill(GREEN);
  doc.fontSize(10).font("Helvetica-Bold").fillColor("white").text(col1, 60, y, { width: 220, continued: false });
  doc.fontSize(10).font("Helvetica-Bold").fillColor("white").text(col2, 290, y, { width: 250 });
  doc.moveDown(0.8);
}

function separator() {
  doc.moveDown(0.3);
  doc.strokeColor("#dce5de").lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);
}

function checkPage(needed = 100) {
  if (doc.y > 750 - needed) doc.addPage();
}

// ─── COVER PAGE ───
doc.rect(0, 0, 595, 842).fill(GREEN);

// Logo
doc.fontSize(60).fillColor("white").font("Helvetica-Bold").text("DZ", 50, 250, { continued: true });
doc.fillColor("#90EE90").text("Colis");

doc.moveDown(1);
doc.fontSize(20).fillColor("white").font("Helvetica").text("Plateforme de Livraison Collaborative", 50);
doc.fontSize(20).fillColor("#90EE90").text("en Algerie", 50);

doc.moveDown(2);
doc.fontSize(13).fillColor("white").font("Helvetica").text("Proposition de Projet", 50);
doc.moveDown(0.5);
doc.fontSize(11).fillColor("rgba(255,255,255,0.7)").text("Mars 2026", 50);

doc.moveDown(4);
doc.strokeColor("rgba(255,255,255,0.3)").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
doc.moveDown(1);
doc.fontSize(11).fillColor("rgba(255,255,255,0.8)").font("Helvetica").text("Document confidentiel - Prepare par Ahmed", 50);

// ─── PAGE 2: LE CONCEPT ───
doc.addPage();

heading("Le Concept", 24);

body("DZColis est une plateforme de co-transport de colis en Algerie. Le principe est simple : connecter les personnes qui veulent envoyer un colis avec des transporteurs qui font deja le trajet et ont de la place dans leur vehicule.");

doc.moveDown(0.5);
subheading("Comment ca marche ?");
bullet("L'expediteur publie son colis (description, trajet, prix)");
bullet("Le transporteur publie son trajet et l'espace disponible");
bullet("Le matching se fait automatiquement");
bullet("Le paiement est securise par sequestre (libere apres livraison)");
bullet("Tout le monde gagne : l'expediteur economise, le transporteur gagne de l'argent");

doc.moveDown(0.5);
subheading("Les avantages cles");
bullet("Jusqu'a 60% moins cher que les transporteurs traditionnels");
bullet("Couverture de 48 wilayas en Algerie");
bullet("Assurance incluse jusqu'a 50 000 DA");
bullet("Paiement securise par sequestre");
bullet("Ecologique : optimisation des trajets existants");

// ─── PAGE 3: DEMO ───
doc.addPage();
heading("Ce Qui a Ete Developpe (Demo)", 24);

body("Une demo complete et fonctionnelle a ete construite pour illustrer le produit final. Voici l'ensemble des pages et fonctionnalites deja en place :");

doc.moveDown(0.5);
subheading("Pages & Interface");

tableHeader("Page", "Description");
tableRow("Page d'accueil", "Hero, recherche, statistiques, avantages, trajets populaires");
separator();
tableRow("Marketplace", "Liste d'annonces avec filtres (type, ville, categorie)");
separator();
tableRow("Detail d'annonce", "Fiche complete avec trajet, prix, profil, messagerie, reservation");
separator();
tableRow("Envoyer un colis", "Formulaire : description, photo, categorie, trajet, prix, assurance");
separator();
tableRow("Proposer un trajet", "Formulaire : trajet, vehicule, capacite, tarif");
separator();
tableRow("Inscription", "Prenom, nom, telephone (+213), email, wilaya (48 wilayas)");
separator();
tableRow("Connexion", "Email/mot de passe + Google et Facebook");
separator();
tableRow("Tableau de bord", "Statistiques, mes annonces, mes reservations");
separator();
tableRow("Messages", "Messagerie avec conversations et chat");
separator();
tableRow("Comment ca marche", "Guide expediteur + transporteur, FAQ");

checkPage(200);
doc.moveDown(0.8);
subheading("Fonctionnalites Operationnelles");

const features = [
  ["Inscription / Connexion / Deconnexion", "Fonctionnel"],
  ["Publication d'annonce (colis)", "Fonctionnel"],
  ["Publication de trajet (transporteur)", "Fonctionnel"],
  ["Recherche et filtres marketplace", "Fonctionnel"],
  ["Reservation et suivi de commande", "Fonctionnel"],
  ["Systeme de messagerie", "Fonctionnel"],
  ["Suivi (en attente > accepte > transit > livre)", "Fonctionnel"],
  ["Notifications (toasts)", "Fonctionnel"],
  ["Tableau de bord utilisateur", "Fonctionnel"],
  ["Design responsive (mobile + desktop)", "Fonctionnel"],
];

tableHeader("Fonctionnalite", "Statut");
for (const [feat, status] of features) {
  checkPage(25);
  tableRow(feat, status);
  separator();
}

// ─── PAGE 4: ROADMAP ───
doc.addPage();
heading("Ce Qu'il Reste Pour la Production", 22);

body("Pour transformer cette demo en produit reel pret a lancer, voici les phases necessaires :");

doc.moveDown(0.5);
subheading("Phase 1 - Backend & Base de Donnees (Fondations)");
bullet("Base de donnees PostgreSQL (utilisateurs, annonces, reservations, messages)");
bullet("API Backend (Node.js ou Python)");
bullet("Authentification securisee (JWT, verification email)");
bullet("Stockage des images (cloud)");
bullet("Hebergement serveur");

doc.moveDown(0.3);
subheading("Phase 2 - Paiement & Securite");
bullet("Integration paiement CIB / EDAHABIA (Algerie)");
bullet("Systeme de sequestre (argent bloque jusqu'a livraison)");
bullet("Commission automatique de 10%");
bullet("Verification d'identite des transporteurs");
bullet("Systeme d'avis et de notation");

doc.moveDown(0.3);
subheading("Phase 3 - Fonctionnalites Avancees");
bullet("Notifications push (email + SMS + navigateur)");
bullet("Matching automatique colis/trajets");
bullet("Suivi GPS en temps reel");
bullet("Chat en temps reel (WebSocket)");
bullet("Tableau de bord administrateur");

doc.moveDown(0.3);
subheading("Phase 4 - Application Mobile");
bullet("Application Android (Play Store)");
bullet("Application iOS (App Store)");
bullet("Notifications push mobile");

doc.moveDown(0.3);
subheading("Phase 5 - Lancement");
bullet("Nom de domaine (dzcolis.dz ou dzcolis.com)");
bullet("SSL, securite, SEO");
bullet("Mentions legales et CGV");
bullet("Tests de charge et beta testing");

// ─── PAGE 5: TIMELINE & COSTS ───
doc.addPage();
heading("Estimation des Delais", 22);

tableHeader("Phase", "Duree estimee");
tableRow("Phase 1 : Backend, BDD, API, hebergement", "3-4 semaines");
separator();
tableRow("Phase 2 : Paiement, verification, securite", "2-3 semaines");
separator();
tableRow("Phase 3 : Notifications, matching, tracking, admin", "3-4 semaines");
separator();
tableRow("Phase 4 : App mobile Android + iOS", "4-5 semaines");
separator();
tableRow("Phase 5 : Lancement, domaine, SEO, juridique", "1-2 semaines");
separator();
doc.moveDown(0.3);
tableRow("MVP (web uniquement, pret a lancer)", "6-8 semaines", true);
tableRow("Version complete (web + mobile)", "13-18 semaines", true);

doc.moveDown(1);
doc.fontSize(10).fillColor(GRAY).font("Helvetica").text("Note : Certaines phases peuvent etre menees en parallele. Un MVP (version minimale fonctionnelle) peut etre pret en 6-8 semaines.", { lineGap: 3 });

doc.moveDown(1);
heading("Couts de Fonctionnement Mensuels", 22);

tableHeader("Service", "Cout/mois estime");
tableRow("Hebergement (serveur + BDD)", "3 000 - 8 000 DA");
separator();
tableRow("Nom de domaine", "~2 000 DA/an");
separator();
tableRow("SMS (notifications)", "~5 000 DA/mois");
separator();
tableRow("Stockage images", "~1 500 DA/mois");
separator();
tableRow("Compte Play Store (une fois)", "~3 500 DA");
separator();
tableRow("Compte App Store (annuel)", "~15 000 DA/an");
separator();
doc.moveDown(0.3);
tableRow("Total mensuel estime", "~10 000 - 15 000 DA/mois", true);

doc.moveDown(0.5);
body("Le modele economique (commission de 10% sur chaque transaction) permet de couvrir ces couts des les premieres transactions.");

// ─── PAGE 6: CLIENT NEEDS & SUMMARY ───
doc.addPage();
heading("Ce Que le Client Doit Fournir", 22);

bullet("Logo definitif et charte graphique (couleurs, polices)");
bullet("Nom de domaine choisi et achete");
bullet("Taux de commission (actuellement 10%)");
bullet("Montant maximum de l'assurance");
bullet("Zones de couverture (48 wilayas ou progressif ?)");
bullet("Mode de paiement accepte (CIB, EDAHABIA, especes ?)");
bullet("Textes juridiques : CGV, mentions legales, confidentialite");
bullet("Contenu : textes de la page d'accueil, FAQ, etc.");

doc.moveDown(1.5);
heading("Resume du Projet", 22);

doc.moveDown(0.3);
tableHeader("Element", "Detail");
tableRow("Projet", "DZColis - Co-transport de colis en Algerie");
separator();
tableRow("Demo", "Fonctionnelle (10 pages, 12+ fonctionnalites)");
separator();
tableRow("Technologie", "Next.js, React, TypeScript, Tailwind CSS");
separator();
tableRow("MVP web", "6-8 semaines");
separator();
tableRow("Version complete (web + mobile)", "13-18 semaines");
separator();
tableRow("Marche cible", "48 wilayas, particuliers et professionnels");
separator();
tableRow("Modele economique", "Commission 10% par transaction");
separator();
tableRow("Cout mensuel", "~10 000 - 15 000 DA");

// ─── FOOTER / SIGNATURE ───
doc.moveDown(2);
doc.strokeColor(GREEN).lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
doc.moveDown(1);

doc.fontSize(14).fillColor(GREEN).font("Helvetica-Bold").text("Developpe par Ahmed - 2026", { align: "center" });
doc.moveDown(0.3);
doc.fontSize(10).fillColor(GRAY).font("Helvetica").text("Document confidentiel", { align: "center" });

doc.end();
console.log("PDF generated: DZColis-Proposition.pdf");
