"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/lib/context";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  if (user) {
    router.push("/tableau-de-bord");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    const success = login(email, password);
    if (success) {
      addToast("Connexion réussie ! Bienvenue sur DZColis");
      router.push("/tableau-de-bord");
    } else {
      setError("Email ou mot de passe incorrect. Créez un compte d'abord.");
    }
  };

  return (
    <div className="bg-dz-gray-50 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-dz-green rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">DZ</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-dz-gray-800 mt-4">Connexion</h1>
          <p className="text-dz-gray-500 mt-1">Bienvenue sur DZColis</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-dz-gray-200 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-dz-red text-sm p-3 rounded-xl">{error}</div>
          )}

          <button type="button" className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-dz-gray-200 rounded-xl hover:bg-dz-gray-50 transition-colors text-sm font-medium text-dz-gray-700">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuer avec Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dz-gray-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-4 text-dz-gray-400">ou</span></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
          </div>

          <button type="submit" className="w-full bg-dz-green hover:bg-dz-green-light text-white py-3 rounded-xl font-semibold transition-colors">
            Se connecter
          </button>
        </form>

        <p className="text-center text-sm text-dz-gray-500 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-dz-green font-medium hover:underline">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
