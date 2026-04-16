"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/context";
import { useI18n } from "@/lib/i18n";
import ThemeToggle from "@/components/ThemeToggle";
import PushNotifications from "@/components/PushNotifications";
import WaselliLogo from "@/components/WaselliLogo";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            <Link href="/annonces" className="text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium transition-colors">
              {t("nav_listings")}
            </Link>
            <Link href="/livreurs" className="text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium transition-colors">
              {t("nav_deliverers")}
            </Link>
            <Link href="/envoyer" className="text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium transition-colors">
              {t("nav_send")}
            </Link>
            <Link href="/transporter" className="text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium transition-colors">
              {t("nav_transport")}
            </Link>
            <Link href="/suivi" className="flex items-center gap-1.5 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {t("nav_tracking")}
            </Link>
            <Link href="/international" className="text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium transition-colors">
              {t("nav_international")}
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
                    <Link href="/tableau-de-bord" className="block px-4 py-2.5 text-sm text-dz-gray-700 dark:text-dz-gray-200 hover:bg-dz-gray-50 dark:hover:bg-dz-gray-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                      📊 {t("nav_dashboard")}
                    </Link>
                    <Link href="/suivi" className="block px-4 py-2.5 text-sm text-dz-gray-700 dark:text-dz-gray-200 hover:bg-dz-gray-50 dark:hover:bg-dz-gray-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                      📦 {t("nav_tracking")}
                    </Link>
                    <Link href="/messages" className="block px-4 py-2.5 text-sm text-dz-gray-700 dark:text-dz-gray-200 hover:bg-dz-gray-50 dark:hover:bg-dz-gray-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                      💬 {t("nav_messages")}
                    </Link>
                    <Link href="/profil" className="block px-4 py-2.5 text-sm text-dz-gray-700 dark:text-dz-gray-200 hover:bg-dz-gray-50 dark:hover:bg-dz-gray-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                      👤 {t("nav_profile")}
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
            <div className="py-1"><ThemeToggle /></div>
            <Link href="/annonces" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_listings")}</Link>
            <Link href="/livreurs" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_deliverers")}</Link>
            <Link href="/envoyer" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_send")}</Link>
            <Link href="/transporter" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_transport")}</Link>
            <Link href="/suivi" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>📦 {t("nav_tracking")}</Link>
            <Link href="/international" className="block py-2 text-dz-gray-600 dark:text-dz-gray-300 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>{t("nav_international")}</Link>
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
