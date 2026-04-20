"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/context";
import { useI18n, type Lang } from "@/lib/i18n";
import ThemeToggle from "@/components/ThemeToggle";
import PushNotifications from "@/components/PushNotifications";
import WaselliLogo from "@/components/WaselliLogo";

/**
 * Header design notes:
 * — Scroll-aware: transparent-ish at top, blurred/opaque after scroll.
 *   The subtle shift gives the site a sense of depth without being showy.
 * — Active route indicator: a 2px underline grown from hover state. This
 *   is the detail that separates a "default template" nav from one that
 *   was actually designed.
 * — Two-tier spacing: primary nav, then user actions with a divider. The
 *   eye doesn't hunt.
 */
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || "/";

  const LANGS: { code: Lang; flag: string; label: string }[] = [
    { code: "fr", flag: "🇫🇷", label: "FR" },
    { code: "ar", flag: "🇩🇿", label: "AR" },
    { code: "en", flag: "🇬🇧", label: "EN" },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Scroll-aware chrome
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const NAV = [
    { href: "/international", label: t("nav_international") },
    { href: "/envoyer",       label: t("nav_send") },
    { href: "/transporter",   label: t("nav_transport") },
    { href: "/annonces",      label: t("nav_listings") },
  ];

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200",
        scrolled
          ? "bg-white/85 dark:bg-[color:var(--card-bg)]/85 backdrop-blur-md border-b border-dz-gray-200"
          : "bg-white dark:bg-[color:var(--card-bg)] border-b border-transparent",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto container-px">
        <div className="flex items-center justify-between h-16">
          <WaselliLogo size="sm" href="/" />

          {/* ── Desktop nav ───────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "relative px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "text-dz-green"
                      : "text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-gray-900 dark:hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                  <span
                    className={[
                      "absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-dz-green transition-opacity",
                      active ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                </Link>
              );
            })}

            <Link
              href="/livreurs"
              className={[
                "relative px-3 py-2 rounded-md text-sm font-medium inline-flex items-center gap-1.5 transition-colors",
                isActive("/livreurs")
                  ? "text-dz-green"
                  : "text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-gray-900 dark:hover:text-white",
              ].join(" ")}
            >
              {t("nav_deliverers")}
              <span className="text-[10px] bg-dz-green text-white px-1.5 py-0.5 rounded-full font-bold leading-none tracking-wide">NEW</span>
              <span className={[
                "absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-dz-green transition-opacity",
                isActive("/livreurs") ? "opacity-100" : "opacity-0",
              ].join(" ")} />
            </Link>

            <Link
              href="/suivi"
              className={[
                "relative px-3 py-2 rounded-md text-sm font-medium inline-flex items-center gap-1.5 transition-colors",
                isActive("/suivi")
                  ? "text-dz-green"
                  : "text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-gray-900 dark:hover:text-white",
              ].join(" ")}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {t("nav_tracking")}
              <span className={[
                "absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-dz-green transition-opacity",
                isActive("/suivi") ? "opacity-100" : "opacity-0",
              ].join(" ")} />
            </Link>
          </nav>

          {/* ── Desktop right actions ─────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            <PushNotifications />
            <ThemeToggle />

            {/* vertical divider */}
            <div className="w-px h-6 bg-dz-gray-200 dark:bg-dz-gray-700 mx-2" />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-dz-gray-50 dark:hover:bg-dz-gray-100/5 pl-1.5 pr-2.5 py-1.5 rounded-lg transition-colors"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                >
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.firstName} className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-dz-gray-200/10 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-dz-green to-dz-green-dark text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                      {user.avatar}
                    </div>
                  )}
                  <span className="text-sm font-medium text-dz-gray-700 dark:text-dz-gray-200 max-w-[120px] truncate">{user.firstName}</span>
                  <svg className={`w-4 h-4 text-dz-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-64 card overflow-hidden animate-fade-up"
                    style={{ boxShadow: "var(--shadow-lg)" }}
                  >
                    <div className="px-4 py-3 border-b border-dz-gray-100 dark:border-dz-gray-200/10">
                      <p className="text-sm font-semibold text-dz-gray-900 dark:text-dz-gray-100 truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-dz-gray-500 dark:text-dz-gray-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <DropdownLink href="/profil" onClick={() => setDropdownOpen(false)} icon="user">{t("nav_profile")}</DropdownLink>
                      <DropdownLink href="/tableau-de-bord" onClick={() => setDropdownOpen(false)} icon="grid">{t("nav_dashboard")}</DropdownLink>
                      <DropdownLink href="/messages" onClick={() => setDropdownOpen(false)} icon="chat">{t("nav_messages")}</DropdownLink>
                      <DropdownLink href="/suivi" onClick={() => setDropdownOpen(false)} icon="track">{t("nav_tracking")}</DropdownLink>
                    </div>

                    <div className="border-t border-dz-gray-100 dark:border-dz-gray-200/10 py-1">
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-dz-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        {t("nav_logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="text-sm px-3 py-2 rounded-md font-medium text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-gray-900 dark:hover:text-white transition-colors"
                >
                  {t("nav_login")}
                </Link>
                <Link href="/inscription" className="btn btn-primary btn-sm ml-1">
                  {t("nav_register")}
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile toggle ────────────────────────────────────── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-dz-gray-600 hover:bg-dz-gray-100 dark:hover:bg-dz-gray-100/5 transition-colors"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>

        {/* ── Mobile nav ──────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden pb-5 border-t border-dz-gray-200 dark:border-dz-gray-200/10 pt-4 space-y-1 animate-fade-up">
            <div className="flex items-center gap-2 pb-3 px-1">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                    lang === l.code
                      ? "bg-dz-green text-white border-dz-green"
                      : "text-dz-gray-600 dark:text-dz-gray-300 border-dz-gray-200 hover:border-dz-green hover:text-dz-green",
                  ].join(" ")}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
              <div className="ml-auto"><ThemeToggle /></div>
            </div>

            <MobileLink href="/international" active={isActive("/international")} onClick={() => setMobileOpen(false)}>{t("nav_international")}</MobileLink>
            <MobileLink href="/envoyer"       active={isActive("/envoyer")}       onClick={() => setMobileOpen(false)}>{t("nav_send")}</MobileLink>
            <MobileLink href="/transporter"   active={isActive("/transporter")}   onClick={() => setMobileOpen(false)}>{t("nav_transport")}</MobileLink>
            <MobileLink href="/annonces"      active={isActive("/annonces")}      onClick={() => setMobileOpen(false)}>{t("nav_listings")}</MobileLink>
            <MobileLink href="/livreurs"      active={isActive("/livreurs")}      onClick={() => setMobileOpen(false)}>
              <span className="flex items-center gap-2">
                {t("nav_deliverers")}
                <span className="text-[10px] bg-dz-green text-white px-1.5 py-0.5 rounded-full font-bold leading-none">NEW</span>
              </span>
            </MobileLink>
            <MobileLink href="/suivi"               active={isActive("/suivi")}               onClick={() => setMobileOpen(false)}>{t("nav_tracking")}</MobileLink>
            <MobileLink href="/comment-ca-marche"   active={isActive("/comment-ca-marche")}   onClick={() => setMobileOpen(false)}>{t("nav_how_it_works")}</MobileLink>

            <div className="divider my-3" />

            {user ? (
              <>
                <MobileLink href="/tableau-de-bord" active={isActive("/tableau-de-bord")} onClick={() => setMobileOpen(false)}>{t("nav_dashboard")}</MobileLink>
                <MobileLink href="/messages"        active={isActive("/messages")}        onClick={() => setMobileOpen(false)}>{t("nav_messages")}</MobileLink>
                <MobileLink href="/profil"          active={isActive("/profil")}          onClick={() => setMobileOpen(false)}>{t("nav_profile")}</MobileLink>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="block w-full text-left px-3 py-2.5 rounded-lg text-dz-red hover:bg-red-50 font-medium"
                >
                  {t("nav_logout")}
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2 px-1">
                <Link
                  href="/connexion"
                  className="flex-1 btn btn-secondary"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav_login")}
                </Link>
                <Link
                  href="/inscription"
                  className="flex-1 btn btn-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav_register")}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

/* ── Local sub-components (keep the JSX of the main tree readable) ── */

function MobileLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "block px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors",
        active
          ? "bg-dz-green/10 text-dz-green"
          : "text-dz-gray-700 dark:text-dz-gray-200 hover:bg-dz-gray-50 dark:hover:bg-dz-gray-100/5",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function DropdownLink({
  href,
  icon,
  onClick,
  children,
}: {
  href: string;
  icon: "user" | "grid" | "chat" | "track";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const path = {
    user:  "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    grid:  "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
    chat:  "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
    track: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  }[icon];

  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-dz-gray-700 dark:text-dz-gray-200 hover:bg-dz-gray-50 dark:hover:bg-dz-gray-100/5 transition-colors"
      role="menuitem"
    >
      <svg className="w-4 h-4 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
      </svg>
      {children}
    </Link>
  );
}
