import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import { LanguageProvider } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/Toast";
import ThemeProvider from "@/components/ThemeProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Waselli — Livraison collaborative Algérie & Europe",
    template: "%s | Waselli",
  },
  description: "Waselli : envoyez vos colis entre l'Algérie et l'Europe grâce à des transporteurs vérifiés. Jusqu'à 5× moins cher que DHL. Paiement sécurisé, assurance incluse. Alger, Oran, Constantine, Paris, Lyon, Bruxelles.",
  keywords: [
    "waselli", "livraison algérie", "envoi colis algérie", "colis algérie france",
    "transporteur algérie", "livraison collaborative", "envoyer colis algérie",
    "livraison pas cher algérie", "colis alger", "colis oran", "dz colis",
    "algérie europe colis", "waseli", "wazelli",
  ],
  metadataBase: new URL("https://www.waselli.com"),
  alternates: { canonical: "https://www.waselli.com" },
  manifest: "/manifest.json",
  themeColor: "#1d4ed8",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Waselli",
    startupImage: "/icons/icon-512.png",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    shortcut: "/icons/icon.svg",
  },
  openGraph: {
    title: "Waselli — Livraison collaborative Algérie & Europe",
    description: "Envoyez vos colis entre l'Algérie et l'Europe grâce à des transporteurs vérifiés. Jusqu'à 5× moins cher que DHL.",
    type: "website",
    url: "https://www.waselli.com",
    locale: "fr_DZ",
    siteName: "Waselli",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "Waselli" }],
  },
  twitter: {
    card: "summary",
    title: "Waselli — Livraison collaborative Algérie & Europe",
    description: "Envoyez vos colis entre l'Algérie et l'Europe grâce à des transporteurs vérifiés.",
    images: ["/icons/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <LanguageProvider>
            <AppProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <ToastContainer />
              <WhatsAppButton />
              <PWAInstallPrompt />
              <LanguageSwitcher />
            </AppProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
