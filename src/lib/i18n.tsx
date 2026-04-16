"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "fr" | "ar" | "en";

const translations = {
  fr: {
    // ── Header nav ──
    nav_listings:      "Annonces",
    nav_deliverers:    "Livreurs",
    nav_send:          "Envoyer",
    nav_transport:     "Transporter",
    nav_tracking:      "Suivi",
    nav_international: "International",
    nav_login:         "Connexion",
    nav_register:      "Inscription",
    nav_dashboard:     "Tableau de bord",
    nav_messages:      "Messages",
    nav_profile:       "Mon profil",
    nav_logout:        "Déconnexion",
    nav_how_it_works:  "Comment ça marche",

    // ── Footer ──
    footer_tagline:    "La première plateforme de livraison collaborative en Algérie. Expédiez malin, voyagez utile.",
    footer_services:   "Services",
    footer_info:       "Informations",
    footer_contact:    "Contact & Support",
    footer_send:       "Envoyer un colis",
    footer_become:     "Devenir transporteur",
    footer_marketplace:"Marketplace",
    footer_intl:       "International 🌍",
    footer_business:   "Solutions Business",
    footer_how:        "Comment ça marche",
    footer_pricing:    "Tarifs",
    footer_insurance:  "Assurance",
    footer_tracking:   "Suivi de colis",
    footer_packaging:  "Conseils emballage",
    footer_faq:        "FAQ",
    footer_about:      "À propos de nous",
    footer_legal:      "Mentions légales",
    footer_terms:      "CGV",
    footer_privacy:    "Confidentialité",
    footer_rights:     "© 2026 Waselli. Tous droits réservés.",
    footer_whatsapp:   "Support WhatsApp",

    // ── Homepage hero ──
    hero_badge:        "Livraison collaborative en Algérie",
    hero_title:        "Envoyez vos colis",
    hero_subtitle:     "Waselli connecte les expéditeurs avec des transporteurs qui font déjà le trajet. Économique, écologique et sécurisé.",
    hero_transporter:  "Vous êtes transporteur ?",
    hero_transporter_cta: "Proposez votre trajet et gagnez de l'argent →",

    // ── Stats ──
    stat_users:     "Utilisateurs",
    stat_wilayas:   "Wilayas couvertes",
    stat_complaints:"Taux de réclamation",
    stat_savings:   "D'économies en moyenne",

    // ── How it works ──
    how_title:   "Comment ça marche",
    how_subtitle:"En 4 étapes simples",
    step1_title: "Publiez votre annonce",
    step1_desc:  "Décrivez votre colis, ajoutez une photo, indiquez le départ et l'arrivée.",
    step2_title: "Recevez des offres",
    step2_desc:  "Les transporteurs sur votre trajet vous envoient leurs propositions.",
    step3_title: "Choisissez et réservez",
    step3_desc:  "Comparez les offres, discutez avec le transporteur, et confirmez.",
    step4_title: "Livraison sécurisée",
    step4_desc:  "Le paiement est libéré uniquement après confirmation de réception.",

    // ── Why us / price comparison ──
    why_badge:    "Pourquoi Waselli ?",
    why_title:    "Jusqu'à 5× moins cher que les agences traditionnelles",
    why_subtitle: "Comparez par vous-même. Même colis, même trajet — prix réels constatés en 2024.",
    table_route:  "Trajet (5 kg)",
    table_note:   "* Prix indicatifs constatés. Waselli = prix négocié directement avec le transporteur.",

    // ── Features ──
    feat1_title: "Économique",
    feat1_desc:  "Jusqu'à 60 % moins cher grâce au co-transport.",
    feat2_title: "Sécurisé",
    feat2_desc:  "Paiement séquestre, assurance incluse, profils vérifiés.",
    feat3_title: "Écologique",
    feat3_desc:  "Optimisez l'espace libre dans les véhicules en circulation.",
    feat4_title: "Tout format",
    feat4_desc:  "Du petit colis au meuble volumineux, aucune limite de taille.",

    // ── Popular routes ──
    routes_title:    "Trajets populaires",
    routes_subtitle: "Les itinéraires les plus demandés",

    // ── International ──
    intl_title:    "Algérie ↔ Europe",
    intl_subtitle: "Service international vers 5 pays européens",
    intl_cta1:     "Voir les transporteurs internationaux",
    intl_cta2:     "Devenir transporteur international",
    country_france:    "France",
    country_spain:     "Espagne",
    country_belgium:   "Belgique",
    country_germany:   "Allemagne",
    country_italy:     "Italie",

    // ── CTA section ──
    cta_title:     "Prêt à envoyer votre premier colis ?",
    cta_subtitle:  "Rejoignez des milliers d'Algériens qui utilisent Waselli pour envoyer et transporter des colis à travers tout le pays.",
    cta_send:      "Envoyer un colis",
    cta_transport: "Devenir transporteur",
    cta_soon:      "Bientôt disponible sur mobile",

    // ── Cycle words (hero animated text) ──
    cycle_1: "partout en Algérie",
    cycle_2: "Alger → Oran",
    cycle_3: "Oran → Tlemcen",
    cycle_4: "Alger → Constantine",

    // ── Auth pages ──
    auth_login_title:      "Connexion",
    auth_login_subtitle:   "Bienvenue sur Waselli",
    auth_email:            "Email",
    auth_password:         "Mot de passe",
    auth_login_btn:        "Se connecter",
    auth_logging_in:       "Connexion...",
    auth_no_account:       "Pas encore de compte ?",
    auth_create_account:   "Créer un compte",
    auth_google:           "Continuer avec Google",
    auth_or:               "ou",
    auth_verified:         "Email vérifié ✓ Vous pouvez maintenant vous connecter.",
    auth_invalid_link:     "Lien de vérification invalide ou expiré.",
    auth_wrong_creds:      "Email ou mot de passe incorrect.",
    auth_email_unconfirmed:"Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.",
    auth_login_success:    "Connexion réussie ! Bienvenue sur Waselli",

    auth_register_title:   "Créer un compte",
    auth_register_subtitle:"Rejoignez la communauté Waselli",
    auth_firstname:        "Prénom",
    auth_lastname:         "Nom",
    auth_phone:            "Téléphone",
    auth_wilaya:           "Wilaya",
    auth_referral:         "Code de parrainage",
    auth_referral_opt:     "(optionnel)",
    auth_terms_check:      "J'ai lu et j'accepte les",
    auth_terms_cgv:        "CGV",
    auth_terms_privacy:    "Politique de confidentialité",
    auth_terms_charter:    "Charte d'utilisation",
    auth_terms_age:        "Je certifie avoir au moins 18 ans.",
    auth_register_btn:     "Créer mon compte",
    auth_registering:      "Création en cours...",
    auth_already_account:  "Déjà un compte ?",
    auth_google_register:  "S'inscrire avec Google",
    auth_or_fast:          "ou inscription rapide",
    auth_fill_required:    "Veuillez remplir tous les champs obligatoires",
    auth_password_short:   "Le mot de passe doit contenir au moins 6 caractères",
    auth_accept_terms:     "Veuillez accepter les conditions d'utilisation",
    auth_email_exists:     "Un compte existe déjà avec cet email.",
    auth_account_created:  "Compte créé ! Vérifiez votre email pour confirmer.",

    auth_verify_title:     "Vérifiez votre email",
    auth_verify_sent:      "Un lien de confirmation a été envoyé à",
    auth_verify_click:     "Cliquez sur ce lien pour activer votre compte Waselli.",
    auth_verify_spam:      "Vous ne trouvez pas l'email ? Vérifiez vos spams.",
    auth_back_login:       "Retour à la connexion →",

    // ── Common ──
    select_wilaya:  "Sélectionner votre wilaya...",
    min_password:   "Minimum 6 caractères",
    from:           "De",
    to:             "À",
    search:         "Rechercher",
  },

  en: {
    nav_listings:      "Listings",
    nav_deliverers:    "Deliverers",
    nav_send:          "Send",
    nav_transport:     "Transport",
    nav_tracking:      "Tracking",
    nav_international: "International",
    nav_login:         "Login",
    nav_register:      "Sign up",
    nav_dashboard:     "Dashboard",
    nav_messages:      "Messages",
    nav_profile:       "My profile",
    nav_logout:        "Logout",
    nav_how_it_works:  "How it works",

    footer_tagline:    "Algeria's first collaborative delivery platform. Ship smart, travel useful.",
    footer_services:   "Services",
    footer_info:       "Information",
    footer_contact:    "Contact & Support",
    footer_send:       "Send a package",
    footer_become:     "Become a transporter",
    footer_marketplace:"Marketplace",
    footer_intl:       "International 🌍",
    footer_business:   "Business Solutions",
    footer_how:        "How it works",
    footer_pricing:    "Pricing",
    footer_insurance:  "Insurance",
    footer_tracking:   "Package tracking",
    footer_packaging:  "Packaging tips",
    footer_faq:        "FAQ",
    footer_about:      "About us",
    footer_legal:      "Legal notice",
    footer_terms:      "Terms",
    footer_privacy:    "Privacy",
    footer_rights:     "© 2026 Waselli. All rights reserved.",
    footer_whatsapp:   "WhatsApp Support",

    hero_badge:        "Collaborative delivery in Algeria",
    hero_title:        "Send your packages",
    hero_subtitle:     "Waselli connects senders with transporters already making the trip. Affordable, eco-friendly, and secure.",
    hero_transporter:  "Are you a transporter?",
    hero_transporter_cta: "Offer your route and earn money →",

    stat_users:     "Users",
    stat_wilayas:   "Provinces covered",
    stat_complaints:"Complaint rate",
    stat_savings:   "Average savings",

    how_title:   "How it works",
    how_subtitle:"In 4 simple steps",
    step1_title: "Post your listing",
    step1_desc:  "Describe your package, add a photo, specify origin and destination.",
    step2_title: "Receive offers",
    step2_desc:  "Transporters on your route send you their proposals.",
    step3_title: "Choose and book",
    step3_desc:  "Compare offers, chat with the transporter, and confirm.",
    step4_title: "Secure delivery",
    step4_desc:  "Payment is released only after delivery confirmation.",

    why_badge:    "Why Waselli?",
    why_title:    "Up to 5× cheaper than traditional agencies",
    why_subtitle: "Compare for yourself. Same package, same route — real prices observed in 2024.",
    table_route:  "Route (5 kg)",
    table_note:   "* Indicative prices. Waselli = price negotiated directly with the transporter.",

    feat1_title: "Affordable",
    feat1_desc:  "Up to 60% cheaper thanks to co-transport.",
    feat2_title: "Secure",
    feat2_desc:  "Escrow payment, insurance included, verified profiles.",
    feat3_title: "Eco-friendly",
    feat3_desc:  "Make use of free space in vehicles already on the road.",
    feat4_title: "Any size",
    feat4_desc:  "From small parcels to large furniture, no size limit.",

    routes_title:    "Popular routes",
    routes_subtitle: "The most requested itineraries",

    intl_title:    "Algeria ↔ Europe",
    intl_subtitle: "International service to 5 European countries",
    intl_cta1:     "View international transporters",
    intl_cta2:     "Become an international transporter",
    country_france:    "France",
    country_spain:     "Spain",
    country_belgium:   "Belgium",
    country_germany:   "Germany",
    country_italy:     "Italy",

    cta_title:     "Ready to send your first package?",
    cta_subtitle:  "Join thousands of Algerians using Waselli to send and transport packages across the country.",
    cta_send:      "Send a package",
    cta_transport: "Become a transporter",
    cta_soon:      "Coming soon on mobile",

    cycle_1: "across Algeria",
    cycle_2: "Algiers → Oran",
    cycle_3: "Oran → Tlemcen",
    cycle_4: "Algiers → Constantine",

    auth_login_title:      "Login",
    auth_login_subtitle:   "Welcome to Waselli",
    auth_email:            "Email",
    auth_password:         "Password",
    auth_login_btn:        "Sign in",
    auth_logging_in:       "Signing in...",
    auth_no_account:       "Don't have an account?",
    auth_create_account:   "Create account",
    auth_google:           "Continue with Google",
    auth_or:               "or",
    auth_verified:         "Email verified ✓ You can now log in.",
    auth_invalid_link:     "Invalid or expired verification link.",
    auth_wrong_creds:      "Incorrect email or password.",
    auth_email_unconfirmed:"Please confirm your email before logging in. Check your inbox.",
    auth_login_success:    "Login successful! Welcome to Waselli",

    auth_register_title:   "Create account",
    auth_register_subtitle:"Join the Waselli community",
    auth_firstname:        "First name",
    auth_lastname:         "Last name",
    auth_phone:            "Phone",
    auth_wilaya:           "Province",
    auth_referral:         "Referral code",
    auth_referral_opt:     "(optional)",
    auth_terms_check:      "I have read and accept the",
    auth_terms_cgv:        "Terms",
    auth_terms_privacy:    "Privacy Policy",
    auth_terms_charter:    "User Charter",
    auth_terms_age:        "I confirm I am at least 18 years old.",
    auth_register_btn:     "Create my account",
    auth_registering:      "Creating...",
    auth_already_account:  "Already have an account?",
    auth_google_register:  "Sign up with Google",
    auth_or_fast:          "or quick sign-up",
    auth_fill_required:    "Please fill in all required fields",
    auth_password_short:   "Password must be at least 6 characters",
    auth_accept_terms:     "Please accept the terms and conditions",
    auth_email_exists:     "An account already exists with this email.",
    auth_account_created:  "Account created! Check your email to confirm.",

    auth_verify_title:     "Check your email",
    auth_verify_sent:      "A confirmation link was sent to",
    auth_verify_click:     "Click the link to activate your Waselli account.",
    auth_verify_spam:      "Can't find the email? Check your spam folder.",
    auth_back_login:       "Back to login →",

    select_wilaya:  "Select your province...",
    min_password:   "Minimum 6 characters",
    from:           "From",
    to:             "To",
    search:         "Search",
  },

  ar: {
    nav_listings:      "الإعلانات",
    nav_deliverers:    "السائقون",
    nav_send:          "إرسال",
    nav_transport:     "نقل",
    nav_tracking:      "تتبع",
    nav_international: "دولي",
    nav_login:         "تسجيل الدخول",
    nav_register:      "إنشاء حساب",
    nav_dashboard:     "لوحة التحكم",
    nav_messages:      "الرسائل",
    nav_profile:       "ملفي",
    nav_logout:        "تسجيل الخروج",
    nav_how_it_works:  "كيف يعمل",

    footer_tagline:    "أول منصة توصيل تعاونية في الجزائر. أرسل بذكاء، سافر بفائدة.",
    footer_services:   "الخدمات",
    footer_info:       "معلومات",
    footer_contact:    "اتصل بنا",
    footer_send:       "إرسال طرد",
    footer_become:     "كن سائقًا",
    footer_marketplace:"السوق",
    footer_intl:       "دولي 🌍",
    footer_business:   "حلول الأعمال",
    footer_how:        "كيف يعمل",
    footer_pricing:    "الأسعار",
    footer_insurance:  "التأمين",
    footer_tracking:   "تتبع الطرد",
    footer_packaging:  "نصائح التعبئة",
    footer_faq:        "أسئلة شائعة",
    footer_about:      "من نحن",
    footer_legal:      "قانوني",
    footer_terms:      "الشروط",
    footer_privacy:    "الخصوصية",
    footer_rights:     "© 2026 Waselli. جميع الحقوق محفوظة.",
    footer_whatsapp:   "دعم واتساب",

    hero_badge:        "توصيل تعاوني في الجزائر",
    hero_title:        "أرسل طرودك",
    hero_subtitle:     "Waselli يربط المرسلين بالسائقين الذين يسلكون نفس الطريق. اقتصادي، بيئي وآمن.",
    hero_transporter:  "هل أنت سائق؟",
    hero_transporter_cta: "اعرض رحلتك واكسب المال →",

    stat_users:     "مستخدم",
    stat_wilayas:   "ولاية مغطاة",
    stat_complaints:"نسبة الشكاوى",
    stat_savings:   "توفير في المتوسط",

    how_title:   "كيف يعمل",
    how_subtitle:"في 4 خطوات بسيطة",
    step1_title: "انشر إعلانك",
    step1_desc:  "صف طردك، أضف صورة، حدد نقطة الانطلاق والوصول.",
    step2_title: "استقبل العروض",
    step2_desc:  "السائقون على طريقك يرسلون لك عروضهم.",
    step3_title: "اختر واحجز",
    step3_desc:  "قارن العروض، تحدث مع السائق، وأكد الحجز.",
    step4_title: "توصيل آمن",
    step4_desc:  "يُحرَّر الدفع فقط بعد تأكيد الاستلام.",

    why_badge:    "لماذا Waselli؟",
    why_title:    "أرخص بـ 5 مرات من الوكالات التقليدية",
    why_subtitle: "قارن بنفسك. نفس الطرد، نفس المسار — أسعار حقيقية لعام 2024.",
    table_route:  "المسار (5 كغ)",
    table_note:   "* أسعار استرشادية. Waselli = سعر متفاوض مباشرة مع السائق.",

    feat1_title: "اقتصادي",
    feat1_desc:  "أرخص بنسبة 60% بفضل النقل المشترك.",
    feat2_title: "آمن",
    feat2_desc:  "دفع بالضمان، تأمين شامل، ملفات موثقة.",
    feat3_title: "بيئي",
    feat3_desc:  "استغل المساحة الحرة في المركبات المتنقلة.",
    feat4_title: "كل الأحجام",
    feat4_desc:  "من الطرود الصغيرة إلى الأثاث الكبير، لا حد للحجم.",

    routes_title:    "المسارات الشائعة",
    routes_subtitle: "أكثر المسارات طلبًا",

    intl_title:    "الجزائر ↔ أوروبا",
    intl_subtitle: "خدمة دولية نحو 5 دول أوروبية",
    intl_cta1:     "عرض السائقين الدوليين",
    intl_cta2:     "كن سائقًا دوليًا",
    country_france:    "فرنسا",
    country_spain:     "إسبانيا",
    country_belgium:   "بلجيكا",
    country_germany:   "ألمانيا",
    country_italy:     "إيطاليا",

    cta_title:     "مستعد لإرسال أول طرد؟",
    cta_subtitle:  "انضم إلى آلاف الجزائريين الذين يستخدمون Waselli لإرسال ونقل الطرود عبر البلاد.",
    cta_send:      "إرسال طرد",
    cta_transport: "كن سائقًا",
    cta_soon:      "قريبًا على الهاتف المحمول",

    cycle_1: "في كل مكان بالجزائر",
    cycle_2: "الجزائر ← وهران",
    cycle_3: "وهران ← تلمسان",
    cycle_4: "الجزائر ← قسنطينة",

    auth_login_title:      "تسجيل الدخول",
    auth_login_subtitle:   "مرحبًا بك في Waselli",
    auth_email:            "البريد الإلكتروني",
    auth_password:         "كلمة المرور",
    auth_login_btn:        "تسجيل الدخول",
    auth_logging_in:       "جارٍ الدخول...",
    auth_no_account:       "ليس لديك حساب؟",
    auth_create_account:   "إنشاء حساب",
    auth_google:           "المتابعة مع Google",
    auth_or:               "أو",
    auth_verified:         "تم التحقق من البريد ✓ يمكنك الآن تسجيل الدخول.",
    auth_invalid_link:     "رابط التحقق غير صالح أو منتهي الصلاحية.",
    auth_wrong_creds:      "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    auth_email_unconfirmed:"يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول. تحقق من صندوق الوارد.",
    auth_login_success:    "تم تسجيل الدخول! مرحبًا بك في Waselli",

    auth_register_title:   "إنشاء حساب",
    auth_register_subtitle:"انضم إلى مجتمع Waselli",
    auth_firstname:        "الاسم",
    auth_lastname:         "اللقب",
    auth_phone:            "الهاتف",
    auth_wilaya:           "الولاية",
    auth_referral:         "كود الإحالة",
    auth_referral_opt:     "(اختياري)",
    auth_terms_check:      "لقد قرأت وأوافق على",
    auth_terms_cgv:        "الشروط",
    auth_terms_privacy:    "سياسة الخصوصية",
    auth_terms_charter:    "ميثاق الاستخدام",
    auth_terms_age:        "أؤكد أن عمري 18 سنة على الأقل.",
    auth_register_btn:     "إنشاء حسابي",
    auth_registering:      "جارٍ الإنشاء...",
    auth_already_account:  "لديك حساب بالفعل؟",
    auth_google_register:  "التسجيل بـ Google",
    auth_or_fast:          "أو تسجيل سريع",
    auth_fill_required:    "يرجى ملء جميع الحقول الإلزامية",
    auth_password_short:   "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل",
    auth_accept_terms:     "يرجى قبول الشروط والأحكام",
    auth_email_exists:     "يوجد حساب بالفعل بهذا البريد الإلكتروني.",
    auth_account_created:  "تم إنشاء الحساب! تحقق من بريدك لتأكيده.",

    auth_verify_title:     "تحقق من بريدك الإلكتروني",
    auth_verify_sent:      "تم إرسال رابط التأكيد إلى",
    auth_verify_click:     "انقر على الرابط لتفعيل حسابك في Waselli.",
    auth_verify_spam:      "لم تجد البريد؟ تحقق من مجلد البريد العشوائي.",
    auth_back_login:       "العودة إلى تسجيل الدخول →",

    select_wilaya:  "اختر ولايتك...",
    min_password:   "6 أحرف على الأقل",
    from:           "من",
    to:             "إلى",
    search:         "بحث",
  },
} as const;

export type TranslationKey = keyof typeof translations.fr;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("waselli_lang") as Lang | null;
    if (saved && ["fr", "ar", "en"].includes(saved)) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("waselli_lang", l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = (key: TranslationKey): string =>
    (translations[lang] as Record<string, string>)[key] ??
    (translations.fr as Record<string, string>)[key] ??
    key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRTL: lang === "ar" }}>
      {children}
    </I18nContext.Provider>
  );
}
