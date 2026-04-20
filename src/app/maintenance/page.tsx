import type { Metadata } from "next";
import Image from "next/image";
import { adminSupabase } from "@/lib/supabase/admin";
import MaintenanceAutoRefresh from "./MaintenanceAutoRefresh";

export const metadata: Metadata = {
  title: "Maintenance — Waselli",
  robots: { index: false, follow: false },
};

// Force dynamic rendering — we want the latest settings on every hit,
// and `searchParams` already opts us out of static anyway.
export const dynamic = "force-dynamic";

const DEFAULT_MESSAGE =
  "Le site est temporairement en maintenance. Nous revenons très bientôt.";

async function getMaintenanceData() {
  // Pull the current message + contact info in a single round-trip so the
  // page renders with the admin's latest values.
  const { data } = await adminSupabase
    .from("platform_settings")
    .select("key, value")
    .in("key", ["maintenance_message", "email_contact", "whatsapp"]);

  const rows = (data ?? []) as { key: string; value: string }[];
  const get = (k: string) => rows.find((r) => r.key === k)?.value ?? "";

  return {
    message: get("maintenance_message") || DEFAULT_MESSAGE,
    email: get("email_contact") || "contact@waselli.com",
    whatsapp: get("whatsapp"),
  };
}

export default async function MaintenancePage({
  searchParams,
}: {
  // Next.js 16: searchParams is a Promise
  searchParams: Promise<{ message?: string }>;
}) {
  const [{ message: dbMessage, email, whatsapp }, { message: queryMessage }] =
    await Promise.all([getMaintenanceData(), searchParams]);

  // Query string (set by the proxy) wins, DB is the fallback
  const message = queryMessage || dbMessage;
  const whatsappClean = whatsapp.replace(/^\+/, "").trim();
  const whatsappUrl = whatsappClean
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(
        "Bonjour Waselli, j'ai une question pendant la maintenance."
      )}`
    : null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, #1e3a8a 0%, #0f172a 50%, #020617 100%)",
      }}
    >
      {/* Decorative blurred orbs */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "#2563eb" }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "#3b82f6" }}
      />

      {/* Header logo */}
      <div className="flex items-center gap-3 mb-10 relative z-10">
        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white/10 backdrop-blur ring-1 ring-white/20">
          <Image
            src="/icons/logo.png"
            alt="Waselli"
            fill
            sizes="48px"
            className="object-contain p-1"
            priority
          />
        </div>
        <span className="text-white font-bold text-2xl tracking-tight">
          Waselli
        </span>
      </div>

      {/* Main card */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 max-w-lg w-full shadow-2xl">
        {/* Animated gear icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/40">
            <svg
              className="w-10 h-10 text-white animate-spin"
              style={{ animationDuration: "6s" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
              Maintenance en cours
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-white font-bold text-2xl sm:text-3xl text-center mb-4 tracking-tight">
          Nous faisons une pause technique
        </h1>

        {/* Admin-defined message */}
        <p
          id="maintenance-message"
          className="text-white/70 text-sm sm:text-base leading-relaxed text-center mb-8"
        >
          {message}
        </p>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

        {/* Contact */}
        <div className="space-y-3">
          <p className="text-white/50 text-xs uppercase tracking-wider text-center font-semibold">
            Besoin d&apos;aide urgente ?
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={`mailto:${email}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium transition-colors"
            >
              <svg
                className="w-4 h-4 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="truncate">{email}</span>
            </a>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl text-white text-sm font-medium transition-colors"
              >
                <svg
                  className="w-4 h-4 text-[#25D366]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Auto-refresh island */}
        <MaintenanceAutoRefresh initialMessage={message} />
      </div>

      {/* Footer */}
      <p className="text-white/30 text-xs mt-10 relative z-10 text-center">
        © {new Date().getFullYear()} Waselli — Livraison collaborative Algérie &amp; Europe
      </p>
    </div>
  );
}
