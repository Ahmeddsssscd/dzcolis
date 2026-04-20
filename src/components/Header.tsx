"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/context";
import { useI18n, type Lang } from "@/lib/i18n";
import ThemeToggle from "@/components/ThemeToggle";
import PushNotifications from "@/components/PushNotifications";
import WaselliLogo from "@/components/WaselliLogo";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const LANGS: { code: Lang; flag: string; label: string }[] = [
    { code: "fr", flag: "🇫🇷", label: "FR" },
    { code: "ar", flag: "🇩🇿", label: "AR" },
    { code: "en", flag: "🇬🇧", label: "EN" },
  ];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="bg-white dark:bg-dz-gray-800 border-b border-dz-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <WaselliLogo size="sm" href="/" />

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/international" className="text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium transition-colors">
              {t("nav_international")}
            </Link>
            <Link href="/envoyer" className="text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium transition-colors">
              {t("nav_send")}
            </Link>
            <Link href="/transporter" className="text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium transition-colors">
              {t("nav_transport")}
            </Link>
            <Link href="/annonces" className="text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium transition-colors">
              {t("nav_listings")}
            </Link>
            <Link href="/livreurs" className="flex items-center gap-1.5 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium transition-colors">
              {t("nav_deliverers")}
              <span className="text-[10px] bg-dz-green text-white px-1.5 py-0.5 rounded-full font-bold leading-none">NEW</span>
            </Link>
            <Link href="/suivi" className="flex items-center gap-1.5 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {t("nav_tracking")}
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <PushNotifications />
            <ThemeToggle />
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-dz-gray-50 px-3 py-2 rounded-xl transition-colors"
                >
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.firstName} className="w-8 h-8 rounded-full object-cover border-2 border-dz-green/30" />
                  ) : (
                    <div className="w-8 h-8 bg-dz-green text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {user.avatar}
                    </div>
                  )}
                  <span className="text-sm font-medium text-dz-gray-700">{user.firstName}</span>
                  <svg className="w-4 h-4 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dz-gray-800 border border-dz-gray-200 dark:border-dz-gray-700 rounded-xl shadow-lg dark:shadow-black/40 py-2">
                    <div className="px-4 py-2 border-b border-dz-gray-100 dark:border-dz-gray-700">
                      <p className="text-sm font-medium text-dz-gray-800 dark:text-dz-gray-100">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-dz-gray-500 dark:text-dz-gray-400">{user.email}</p>
                    </div>
                    <Link href="/profil" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dz-gray-700 dark:text-dz-gray-200 hover:bg-dz-gray-50 dark:hover:bg-dz-gray-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                      <svg className="w-4 h-4 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                      {t("nav_profile")}
                    </Link>
                    <Link href="/tableau-de-bord" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dz-gray-700 dark:text-dz-gray-200 hover:bg-dz-gray-50 dark:hover:bg-dz-gray-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                      <svg className="w-4 h-4 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                      {t("nav_dashboard")}
                    </Link>
                    <Link href="/messages" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dz-gray-700 dark:text-dz-gray-200 hover:bg-dz-gray-50 dark:hover:bg-dz-gray-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                      <svg className="w-4 h-4 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                      {t("nav_messages")}
                    </Link>
                    <Link href="/suivi" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dz-gray-700 dark:text-dz-gray-200 hover:bg-dz-gray-50 dark:hover:bg-dz-gray-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                      <svg className="w-4 h-4 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      {t("nav_tracking")}
                    </Link>
                    <div className="border-t border-dz-gray-100 dark:border-dz-gray-700 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-dz-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        {t("nav_logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/connexion" className="text-dz-gray-600 hover:text-dz-green font-medium transition-colors">
                  {t("nav_login")}
                </Link>
                <Link href="/inscription" className="bg-dz-green hover:bg-dz-green-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors">
                  {t("nav_register")}
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-dz-gray-600 hover:bg-dz-gray-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-dz-gray-200 dark:border-dz-gray-700 pt-4 space-y-2 bg-white dark:bg-dz-gray-800">
            {/* Language switcher row */}
            <div className="flex items-center gap-2 pb-2">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors
                    ${lang === l.code
                      ? "bg-dz-green text-white border-dz-green"
                      : "text-dz-gray-600 border-dz-gray-200 hover:border-dz-green hover:text-dz-green"
                    }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
            <div className="py-1"><ThemeToggle /></div>
            <Link href="/international" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_international")}</Link>
            <Link href="/envoyer" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_send")}</Link>
            <Link href="/transporter" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_transport")}</Link>
            <Link href="/annonces" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_listings")}</Link>
            <Link href="/livreurs" className="flex items-center gap-2 py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>
              {t("nav_deliverers")}
              <span className="text-[10px] bg-dz-green text-white px-1.5 py-0.5 rounded-full font-bold leading-none">NEW</span>
            </Link>
            <Link href="/suivi" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_tracking")}</Link>
            <Link href="/comment-ca-marche" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_how_it_works")}</Link>
            {user ? (
              <>
                <Link href="/tableau-de-bord" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_dashboard")}</Link>
                <Link href="/messages" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_messages")}</Link>
                <Link href="/profil" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_profile")}</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-2 text-dz-red font-medium">{t("nav_logout")}</button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link href="/connexion" className="text-dz-gray-600 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_login")}</Link>
                <Link href="/inscription" className="bg-dz-green text-white px-4 py-2 rounded-xl font-medium" onClick={() => setMobileOpen(false)}>{t("nav_register")}</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
