"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

/* ─── Types mirroring /api/admin/me ────────────────────────────────── */

export type AdminRole = "viewer" | "support" | "moderator" | "admin" | "super_admin";

interface SessionProp {
  userId: string;
  email: string;
  fullName: string | null;
  role: AdminRole;
}

const ROLE_I18N_KEY: Record<AdminRole, AdminKey> = {
  viewer: "adm_role_viewer",
  support: "adm_role_support",
  moderator: "adm_role_moderator",
  admin: "adm_role_admin",
  super_admin: "adm_role_super_admin",
};

const ROLE_STYLES: Record<AdminRole, string> = {
  viewer: "bg-gray-500/20 text-gray-300",
  support: "bg-blue-500/20 text-blue-300",
  moderator: "bg-purple-500/20 text-purple-300",
  admin: "bg-amber-500/20 text-amber-300",
  super_admin: "bg-red-500/20 text-red-300",
};

const ROLE_RANK: Record<AdminRole, number> = {
  viewer: 0,
  support: 1,
  moderator: 2,
  admin: 3,
  super_admin: 4,
};

function hasRole(current: AdminRole, min: AdminRole) {
  return ROLE_RANK[current] >= ROLE_RANK[min];
}

/* ─── SVG icons (kept inline; no icon lib dep) ─────────────────────── */

type IconKey =
  | "dashboard" | "systeme" | "utilisateurs" | "annonces" | "expeditions"
  | "kyc" | "litiges" | "livreurs" | "paiements" | "parametres" | "equipe"
  | "journal" | "support" | "contact";

const ICONS: Record<IconKey, React.ReactNode> = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  systeme: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  utilisateurs: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  annonces: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  expeditions: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2.5.01M13 16H9m4 0h3m2-5h-5V6m5 5l1.5 2.5M16 11V6h2l3 5" />
    </svg>
  ),
  kyc: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  litiges: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  livreurs: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  paiements: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  parametres: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  equipe: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  journal: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  support: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  contact: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

/*
 * Nav items. `minRole` is the minimum role that sees the entry; items
 * a role can't access are HIDDEN (not just disabled). Server-side route
 * guards still enforce access — this is UX only.
 *
 * `labelKey` is resolved via `useAdminT()` at render time so switching
 * language live updates every nav entry.
 */
interface NavItem {
  href: string;
  labelKey: AdminKey;
  iconKey: IconKey;
  badgeKey?: "kyc" | "litiges" | "livreurs";
  minRole: AdminRole;
}

/*
 * Role → page access matrix (single source of truth for both NAV
 * visibility and the client-side forbidden redirect below):
 *
 *  viewer      → dashboard only
 *  support     → + users, listings, shipments, support chat, disputes
 *  moderator   → + KYC, courier applications
 *  admin       → + payments/revenue, audit journal, system audit, settings
 *  super_admin → + team management (add/remove admins)
 *
 * NO role (except admin+) can see financial data (paiements, revenus).
 * API routes enforce the same matrix via requireAction() + ACTION_MIN_ROLE.
 */
const NAV: NavItem[] = [
  { href: "/admin",              labelKey: "adm_nav_dashboard", iconKey: "dashboard",    minRole: "viewer"      },

  // support+
  { href: "/admin/utilisateurs", labelKey: "adm_nav_users",     iconKey: "utilisateurs", minRole: "support"     },
  { href: "/admin/annonces",     labelKey: "adm_nav_listings",  iconKey: "annonces",     minRole: "support"     },
  { href: "/admin/expeditions",  labelKey: "adm_nav_shipments", iconKey: "expeditions",  minRole: "support"     },
  { href: "/admin/support",      labelKey: "adm_nav_support",   iconKey: "support",      minRole: "support"     },
  // /admin/contact hidden from nav — public form now emails contact@waselli.com
  // directly; route + DB still exist as fallback if email delivery fails.
  { href: "/admin/litiges",      labelKey: "adm_nav_disputes",  iconKey: "litiges",      badgeKey: "litiges",  minRole: "support"     },

  // moderator+
  { href: "/admin/kyc",          labelKey: "adm_nav_kyc",       iconKey: "kyc",          badgeKey: "kyc",      minRole: "moderator"   },
  { href: "/admin/livreurs",     labelKey: "adm_nav_couriers",  iconKey: "livreurs",     badgeKey: "livreurs", minRole: "moderator"   },

  // admin+ (financial + system — hidden from support/moderator)
  { href: "/admin/paiements",    labelKey: "adm_nav_payments",  iconKey: "paiements",    minRole: "admin"       },
  { href: "/admin/journal",      labelKey: "adm_nav_audit",     iconKey: "journal",      minRole: "admin"       },
  { href: "/admin/systeme",      labelKey: "adm_nav_systeme",   iconKey: "systeme",      minRole: "admin"       },
  { href: "/admin/parametres",   labelKey: "adm_nav_settings",  iconKey: "parametres",   minRole: "admin"       },

  // super_admin only
  { href: "/admin/equipe",       labelKey: "adm_nav_team",      iconKey: "equipe",       minRole: "super_admin" },
];

/**
 * Locale-aware date formatter. Falls back gracefully if the browser
 * doesn't recognize the BCP-47 tag (very rare with modern engines).
 */
function formatDate(lang: "fr" | "en" | "ar") {
  const tag = lang === "ar" ? "ar-DZ" : lang === "en" ? "en-US" : "fr-FR";
  try {
    return new Date().toLocaleDateString(tag, {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("fr-FR", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  }
}

function initialsOf(s: SessionProp): string {
  if (s.fullName) {
    const parts = s.fullName.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }
  return s.email.slice(0, 2).toUpperCase();
}

export default function AdminShell({
  session,
  children,
}: {
  session: SessionProp;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState<{ kyc: number; litiges: number; livreurs: number }>({
    kyc: 0, litiges: 0, livreurs: 0,
  });
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang, isRTL } = useAdminT();

  const visibleNav = useMemo(
    () => NAV.filter((item) => hasRole(session.role, item.minRole)),
    [session.role]
  );

  // ── Forbidden-page redirect ──────────────────────────────────────────
  // Hides nav items above covers 99% of cases, but a user can still type
  // a URL directly. This effect catches that: if the current path maps to
  // a NAV item whose minRole exceeds the user's role, silently redirect
  // back to the dashboard. API routes enforce the same rules independently,
  // so the user would only see an empty/error page anyway.
  useEffect(() => {
    const navItem = NAV.find(
      (n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href + "/"))
    );
    if (navItem && !hasRole(session.role, navItem.minRole)) {
      router.replace("/admin");
    }
  }, [pathname, session.role, router]);

  useEffect(() => {
    // Refresh badge counts on every navigation. Errors are swallowed so
    // one flaky endpoint doesn't poison the whole sidebar.
    (async () => {
      try {
        const [stats, apps, litiges] = await Promise.all([
          fetch("/api/admin/stats").then((r) => r.json()).catch(() => null),
          fetch("/api/courier-applications").then((r) => r.json()).catch(() => null),
          fetch("/api/admin/litiges").then((r) => r.json()).catch(() => null),
        ]);
        setBadges({
          kyc: stats?.kyc_pending ?? 0,
          livreurs: Array.isArray(apps) ? apps.filter((a: { status: string }) => a.status === "pending").length : 0,
          litiges: litiges && typeof litiges === "object"
            ? Object.keys(litiges).length  // unresolved/open — approximation
            : 0,
        });
      } catch {/* noop */}
    })();
  }, [pathname]);

  async function handleLogout() {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  /*
   * RTL layout: put the sidebar on the right and flip the mobile slide
   * direction so the off-screen state is still off-screen. We keep all
   * text alignment handled by the `dir="rtl"` attribute set by the
   * global LanguageProvider — we only need to invert the horizontal
   * axis for the fixed sidebar here.
   */
  const sidebarSideClass = isRTL
    ? `right-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`
    : `left-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 h-full z-30 flex flex-col transition-transform duration-300 ${sidebarSideClass} lg:translate-x-0 lg:static lg:z-auto`}
        style={{ width: 260, backgroundColor: "#111827" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700/50">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: "#1d4ed8" }}
          >
            W
          </div>
          <div className="min-w-0">
            <span className="text-white font-bold text-base">Waselli</span>
            <span className="text-blue-400 font-bold text-base"> {t("adm_sidebar_brand_suffix")}</span>
          </div>
          <button
            className="ms-auto text-gray-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label={t("adm_menu_close")}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {ICONS[item.iconKey]}
                <span className="flex-1">{t(item.labelKey)}</span>
                {item.badgeKey && badgeCount > 0 && (
                  <span className={`${item.badgeKey === "kyc" ? "bg-red-500" : "bg-yellow-500"} text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center`}>
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Identity card + prominent logout. Kept as a single calm
            footer block so the info isn't scattered across the chrome. */}
        <div className="px-4 py-4 border-t border-gray-700/50 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initialsOf(session)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {session.fullName ?? session.email.split("@")[0]}
              </p>
              <p className="text-gray-500 text-[11px] truncate">{session.email}</p>
            </div>
            <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap ${ROLE_STYLES[session.role]}`}>
              {t(ROLE_I18N_KEY[session.role])}
            </span>
          </div>

          {/* Prominent logout — unmissable, full-width, destructive tone */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-red-600/90 hover:bg-red-600 active:bg-red-700 transition-colors px-3 py-2.5 rounded-xl shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t("adm_logout_prominent")}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-900 p-1"
            onClick={() => setSidebarOpen(true)}
            aria-label={t("adm_menu_open")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-gray-900 font-semibold text-base truncate">{t("adm_header_title")}</h1>
            <p className="text-gray-400 text-xs capitalize truncate">{formatDate(lang)}</p>
          </div>
          {/*
            Secondary logout kept for muscle memory on the top-right,
            but the primary one lives in the sidebar. On small screens
            we hide this to avoid visual clutter — the sidebar button
            is the canonical one.
          */}
          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t("adm_logout")}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
