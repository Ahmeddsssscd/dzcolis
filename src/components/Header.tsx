"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/context";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
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
    <header className="bg-white border-b border-dz-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-dz-green rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">DZ</span>
            </div>
            <span className="text-xl font-bold text-dz-gray-800">
              DZ<span className="text-dz-green">Colis</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/envoyer" className="text-dz-gray-600 hover:text-dz-green font-medium transition-colors">
              Envoyer un colis
            </Link>
            <Link href="/transporter" className="text-dz-gray-600 hover:text-dz-green font-medium transition-colors">
              Transporter
            </Link>
            <Link href="/annonces" className="text-dz-gray-600 hover:text-dz-green font-medium transition-colors">
              Annonces
            </Link>
            <Link href="/comment-ca-marche" className="text-dz-gray-600 hover:text-dz-green font-medium transition-colors">
              Comment ça marche
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-dz-gray-50 px-3 py-2 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-dz-green text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.avatar}
                  </div>
                  <span className="text-sm font-medium text-dz-gray-700">{user.firstName}</span>
                  <svg className="w-4 h-4 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-dz-gray-200 rounded-xl shadow-lg py-2">
                    <div className="px-4 py-2 border-b border-dz-gray-100">
                      <p className="text-sm font-medium text-dz-gray-800">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-dz-gray-500">{user.email}</p>
                    </div>
                    <Link href="/tableau-de-bord" className="block px-4 py-2.5 text-sm text-dz-gray-700 hover:bg-dz-gray-50" onClick={() => setDropdownOpen(false)}>
                      Tableau de bord
                    </Link>
                    <Link href="/messages" className="block px-4 py-2.5 text-sm text-dz-gray-700 hover:bg-dz-gray-50" onClick={() => setDropdownOpen(false)}>
                      Messages
                    </Link>
                    <Link href="/tableau-de-bord" className="block px-4 py-2.5 text-sm text-dz-gray-700 hover:bg-dz-gray-50" onClick={() => setDropdownOpen(false)}>
                      Mes annonces
                    </Link>
                    <div className="border-t border-dz-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-dz-red hover:bg-red-50"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/connexion" className="text-dz-gray-600 hover:text-dz-green font-medium transition-colors">
                  Connexion
                </Link>
                <Link href="/inscription" className="bg-dz-green hover:bg-dz-green-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors">
                  Inscription
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
          <div className="md:hidden pb-4 border-t border-dz-gray-200 pt-4 space-y-2">
            <Link href="/envoyer" className="block py-2 text-dz-gray-600 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>Envoyer un colis</Link>
            <Link href="/transporter" className="block py-2 text-dz-gray-600 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>Transporter</Link>
            <Link href="/annonces" className="block py-2 text-dz-gray-600 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>Annonces</Link>
            <Link href="/comment-ca-marche" className="block py-2 text-dz-gray-600 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>Comment ça marche</Link>
            {user ? (
              <>
                <Link href="/tableau-de-bord" className="block py-2 text-dz-gray-600 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>Tableau de bord</Link>
                <Link href="/messages" className="block py-2 text-dz-gray-600 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>Messages</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-2 text-dz-red font-medium">Déconnexion</button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link href="/connexion" className="text-dz-gray-600 hover:text-dz-green font-medium" onClick={() => setMobileOpen(false)}>Connexion</Link>
                <Link href="/inscription" className="bg-dz-green text-white px-4 py-2 rounded-xl font-medium" onClick={() => setMobileOpen(false)}>Inscription</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
