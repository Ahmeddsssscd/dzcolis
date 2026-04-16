"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "fr" | "ar" | "en";

// ── Translations ─────────────────────────────────────────────────────────────

const translations = {
  fr: {
    // Header nav
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

    // Footer
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

    // Auth pages
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

    auth_verify_title:     "Vérifiez votre email",
    auth_verify_sent:      "Un lien de confirmation a été envoyé à",
    auth_verify_click:     "Cliquez sur ce lien pour activer votre compte Waselli.",
    auth_verify_spam:      "Vous ne trouvez pas l'email ? Vérifiez vos spams.",
    auth_back_login:       "Retour à la connexion →",

    // Common
    select_wilaya:  "Sélectionner votre wilaya...",
    min_password:   "Minimum 6 caractères",
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

    auth_verify_title:     "Check your email",
    auth_verify_sent:      "A confirmation link was sent to",
    auth_verify_click:     "Click the link to activate your Waselli account.",
    auth_verify_spam:      "Can't find the email? Check your spam folder.",
    auth_back_login:       "Back to login →",

    select_wilaya:  "Select your province...",
    min_password:   "Minimum 6 characters",
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

    auth_verify_title:     "تحقق من بريدك الإلكتروني",
    auth_verify_sent:      "تم إرسال رابط التأكيد إلى",
    auth_verify_click:     "انقر على الرابط لتفعيل حسابك في Waselli.",
    auth_verify_spam:      "لم تجد البريد؟ تحقق من مجلد البريد العشوائي.",
    auth_back_login:       "العودة إلى تسجيل الدخول →",

    select_wilaya:  "اختر ولايتك...",
    min_password:   "6 أحرف على الأقل",
  },
} as const;

export type TranslationKey = keyof typeof translations.fr;

// ── Context ───────────────────────────────────────────────────────────────────

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
