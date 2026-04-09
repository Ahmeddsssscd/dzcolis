# DZColis - Plateforme de Livraison Collaborative en Algérie

## Proposition de Projet

---

### Le Concept

DZColis est une plateforme de **co-transport de colis** en Algérie. Le principe : connecter les personnes qui veulent envoyer un colis avec des transporteurs qui font déjà le trajet et ont de la place dans leur véhicule.

- **L'expéditeur** publie son colis (description, trajet, prix)
- **Le transporteur** publie son trajet et l'espace disponible
- **Le matching** se fait automatiquement
- **Le paiement** est sécurisé par séquestre (l'argent est libéré après livraison)
- **Tout le monde gagne** : l'expéditeur économise, le transporteur gagne de l'argent

---

### Ce Qui a Été Développé (Démo Fonctionnelle)

Une démo complète a été construite pour montrer le fonctionnement de la plateforme. Voici ce qui est déjà en place :

#### Pages & Interface
| Page | Description |
|------|-------------|
| Page d'accueil | Hero, recherche, statistiques, comment ça marche, avantages, trajets populaires, CTA |
| Marketplace (Annonces) | Liste de toutes les annonces avec filtres (type, ville départ/arrivée, catégorie) |
| Détail d'annonce | Fiche complète : trajet, prix, poids, dimensions, profil utilisateur, messagerie, réservation, détail du prix avec commission |
| Envoyer un colis | Formulaire complet : description, photo, catégorie, trajet, date, prix, assurance |
| Proposer un trajet | Formulaire : trajet, véhicule (voiture/fourgon/camionnette/camion), capacité, tarif |
| Inscription | Prénom, nom, téléphone (+213), email, mot de passe, wilaya (48 wilayas) |
| Connexion | Email/mot de passe + boutons Google et Facebook |
| Tableau de bord | Statistiques, mes annonces, mes réservations avec gestion de statut |
| Messages | Système de messagerie avec liste de conversations et chat en temps réel |
| Comment ça marche | Guide expéditeur + transporteur en 4 étapes, FAQ |

#### Fonctionnalités Opérationnelles
| Fonctionnalité | Statut |
|----------------|--------|
| Inscription / Connexion / Déconnexion | Fonctionnel |
| Publication d'annonce (colis) | Fonctionnel |
| Publication de trajet (transporteur) | Fonctionnel |
| Recherche et filtres sur le marketplace | Fonctionnel |
| Page de détail avec réservation | Fonctionnel |
| Système de messagerie | Fonctionnel |
| Suivi de commande (en attente → accepté → en transit → livré) | Fonctionnel |
| Notifications (toasts) | Fonctionnel |
| Tableau de bord utilisateur | Fonctionnel |
| Protection des pages (redirection si non connecté) | Fonctionnel |
| Design responsive (mobile + desktop) | Fonctionnel |

#### Choix Techniques Actuels
- **Framework** : Next.js 16 (React) + TypeScript
- **Design** : Tailwind CSS, couleurs vert/blanc (drapeau algérien)
- **Données** : LocalStorage (démo), 30 villes algériennes, 8 annonces exemple
- **Monnaie** : Dinar Algérien (DA)
- **Langue** : Français

---

### Ce Qu'il Reste à Faire Pour la Production

Pour transformer cette démo en produit réel prêt à lancer, voici les étapes nécessaires :

#### Phase 1 — Backend & Base de Données (Fondations)
| Élément | Description |
|---------|-------------|
| Base de données | PostgreSQL — utilisateurs, annonces, réservations, messages, avis |
| API Backend | Node.js (NestJS) ou Python (FastAPI) — toute la logique serveur |
| Authentification | Système sécurisé avec JWT, vérification email, récupération mot de passe |
| Stockage images | AWS S3 ou Cloudflare R2 pour les photos de colis |
| Hébergement | Serveur cloud (Vercel + Railway ou VPS) |

#### Phase 2 — Paiement & Sécurité
| Élément | Description |
|---------|-------------|
| Paiement séquestre | Intégration CIB/EDAHABIA (Algérie) ou Stripe — l'argent est bloqué jusqu'à la livraison |
| Système de commission | 10% prélevé automatiquement sur chaque transaction |
| Vérification d'identité | Vérification de carte d'identité nationale pour les transporteurs |
| Système d'avis | Notes et commentaires après chaque livraison |
| Signalement & litiges | Interface admin pour gérer les problèmes |

#### Phase 3 — Fonctionnalités Avancées
| Élément | Description |
|---------|-------------|
| Notifications push | Email + SMS (Twilio) + notifications navigateur |
| Matching automatique | Algorithme qui matche les colis avec les trajets compatibles |
| Suivi en temps réel | Tracking GPS du colis pendant le transport |
| Chat en temps réel | WebSocket pour messagerie instantanée |
| Tableau de bord admin | Gestion des utilisateurs, annonces, litiges, statistiques, revenus |

#### Phase 4 — Application Mobile
| Élément | Description |
|---------|-------------|
| App Android | Application native ou React Native |
| App iOS | Application native ou React Native |
| Notifications push | Push notifications sur mobile |
| Publication Play Store / App Store | Comptes développeur, soumission, validation |

#### Phase 5 — Lancement
| Élément | Description |
|---------|-------------|
| Nom de domaine | dzcolis.dz ou dzcolis.com |
| SSL & sécurité | Certificat HTTPS, protection contre les attaques |
| SEO | Optimisation pour Google, pages référencées |
| Mentions légales, CGV | Textes juridiques conformes à la loi algérienne |
| Tests & QA | Tests de charge, tests de sécurité, beta testing |

---

### Estimation des Délais

| Phase | Contenu | Durée estimée |
|-------|---------|---------------|
| Phase 1 | Backend, BDD, auth, API, hébergement | 3–4 semaines |
| Phase 2 | Paiement, vérification, avis, sécurité | 2–3 semaines |
| Phase 3 | Notifications, matching, tracking, admin | 3–4 semaines |
| Phase 4 | App mobile Android + iOS | 4–5 semaines |
| Phase 5 | Lancement, domaine, SEO, juridique | 1–2 semaines |
| **TOTAL** | **Plateforme complète (web + mobile)** | **13–18 semaines** |

> Note : Certaines phases peuvent être menées en parallèle. Un MVP (version minimale fonctionnelle) peut être prêt en **6–8 semaines** (Phases 1 + 2 + lancement web uniquement).

---

### Coûts de Fonctionnement Mensuels (Après Lancement)

| Service | Coût/mois estimé |
|---------|-----------------|
| Hébergement (serveur + BDD) | 3 000 – 8 000 DA |
| Nom de domaine | ~2 000 DA/an |
| SMS (notifications) | ~5 000 DA/mois (selon volume) |
| Stockage images | ~1 500 DA/mois |
| Compte Play Store (une fois) | ~3 500 DA |
| Compte App Store (annuel) | ~15 000 DA/an |
| **Total mensuel estimé** | **~10 000 – 15 000 DA/mois** |

> Le modèle économique (commission de 10% sur chaque transaction) permet de couvrir ces coûts dès les premières transactions.

---

### Ce Que le Client Doit Fournir

1. **Logo définitif** et charte graphique (couleurs, polices)
2. **Nom de domaine** choisi et acheté
3. **Décisions business** :
   - Taux de commission (actuellement 10%)
   - Montant maximum de l'assurance
   - Zones de couverture (48 wilayas ou progressif)
   - Mode de paiement accepté (CIB, EDAHABIA, espèces à la livraison)
4. **Textes juridiques** : CGV, mentions légales, politique de confidentialité
5. **Contenu** : textes de la page d'accueil, FAQ, etc.

---

### Résumé

| | |
|---|---|
| **Projet** | DZColis — Plateforme de co-transport de colis en Algérie |
| **Démo** | Fonctionnelle et visible (10 pages, 12+ fonctionnalités) |
| **Technologie** | Next.js, React, TypeScript, Tailwind CSS |
| **MVP web** | 6–8 semaines |
| **Version complète (web + mobile)** | 13–18 semaines |
| **Marché cible** | 48 wilayas, particuliers et professionnels |
| **Modèle économique** | Commission 10% par transaction |
| **Coût mensuel** | ~10 000 – 15 000 DA |

---

*Développé par Ahmed — 2026*
