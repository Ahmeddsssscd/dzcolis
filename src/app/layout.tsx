import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/Toast";
import ThemeProvider from "@/components/ThemeProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Waselli — Livraison collaborative Algérie ↔ Europe",
  description: "Envoyez vos colis entre l'Algérie et l'Europe grâce à des voyageurs vérifiés. 5× moins cher que DHL. Paiement sécurisé, assurance incluse.",
  manifest: "/manifest.json",
  themeColor: "#16a34a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Waselli",
    startupImage: "/icons/icon-512.png",
  },
  icons: {
    icon: "/icons/icon-512.png",
    apple: "/icons/icon-512.png",
  },
  openGraph: {
    title: "Waselli — Livraison collaborative Algérie ↔ Europe",
    description: "Envoyez vos colis entre l'Algérie et l'Europe grâce à des voyageurs vérifiés. 5× moins cher que DHL.",
    type: "website",
    locale: "fr_DZ",
    siteName: "Waselli",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AppProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <ToastContainer />
            <WhatsAppButton />
            <PWAInstallPrompt />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
