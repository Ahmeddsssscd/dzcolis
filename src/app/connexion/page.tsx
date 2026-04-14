"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useToast } from "@/lib/context";
import DzColisLogo from "@/components/DzColisLogo";

export default function ConnexionPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [info, setInfo]         = useState("");

  const { login, user } = useAuth();
  const { addToast }    = useToast();
  const router          = useRouter();
  const searchParams    = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verified") === "1") setInfo("Email vérifié ✓ Vous pouvez maintenant vous connecter.");
    if (searchParams.get("error") === "auth_callback_failed") setError("Lien de vérification invalide ou expiré.");
  }, [searchParams]);

  useEffect(() => {
    if (user) router.replace("/tableau-de-bord");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Veuillez remplir tous les champs"); return; }
    setLoading(true);
    const { error: err } = await login(email, password);
    setLoading(false);
    if (err) {
      if (err.includes("Email not confirmed")) {
        setError("Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.");
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    } else {
      addToast("Connexion réussie ! Bienvenue sur DZColis");
      router.push("/tableau-de-bord");
    }
  };

  return (
    <div className="bg-dz-gray-50 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <DzColisLogo size="md" href="/" />
          </div>
          <h1 className="text-2xl font-bold text-dz-gray-800 mt-2">Connexion</h1>
          <p className="text-dz-gray-500 mt-1">Bienvenue sur DZColis</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-dz-gray-200 p-6 space-y-4">
          {info  && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl">{info}</div>}
          {error && <div className="bg-red-50 text-dz-red text-sm p-3 rounded-xl">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">Mot de passe</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-dz-green hover:bg-dz-green-light disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? "Connexion..." : "Se connecter"}
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
