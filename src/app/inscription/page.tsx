"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useToast } from "@/lib/context";
import WaselliLogo from "@/components/WaselliLogo";

const WILAYAS = [
  "01 - Adrar","02 - Chlef","03 - Laghouat","04 - Oum El Bouaghi","05 - Batna",
  "06 - Béjaïa","07 - Biskra","08 - Béchar","09 - Blida","10 - Bouira",
  "11 - Tamanrasset","12 - Tébessa","13 - Tlemcen","14 - Tiaret","15 - Tizi Ouzou",
  "16 - Alger","17 - Djelfa","18 - Jijel","19 - Sétif","20 - Saïda",
  "21 - Skikda","22 - Sidi Bel Abbès","23 - Annaba","24 - Guelma","25 - Constantine",
  "26 - Médéa","27 - Mostaganem","28 - M'sila","29 - Mascara","30 - Ouargla",
  "31 - Oran","32 - El Bayadh","33 - Illizi","34 - Bordj Bou Arréridj",
  "35 - Boumerdès","36 - El Tarf","37 - Tindouf","38 - Tissemsilt",
  "39 - El Oued","40 - Khenchela","41 - Souk Ahras","42 - Tipaza",
  "43 - Mila","44 - Aïn Defla","45 - Naâma","46 - Aïn Témouchent",
  "47 - Ghardaïa","48 - Relizane",
];

export default function InscriptionPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", wilaya: "", referralCode: "", acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const { register, user } = useAuth();
  const { addToast }       = useToast();
  const router             = useRouter();
  const justRegistered     = useRef(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setForm((prev) => ({ ...prev, referralCode: ref }));
  }, [searchParams]);

  useEffect(() => {
    if (user && !justRegistered.current) router.replace("/tableau-de-bord");
  }, [user, router]);

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      setError("Veuillez remplir tous les champs obligatoires"); return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères"); return;
    }
    if (!form.acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation"); return;
    }
    setLoading(true);
    justRegistered.current = true;
    const { error: err } = await register({
      firstName: form.firstName, lastName: form.lastName,
      email: form.email, phone: form.phone,
      wilaya: form.wilaya, password: form.password,
      referredBy: form.referralCode.trim() || undefined,
    });
    setLoading(false);
    if (err) {
      justRegistered.current = false;
      if (err.includes("already registered") || err.includes("already exists")) {
        setError("Un compte existe déjà avec cet email.");
      } else {
        setError(err);
      }
    } else {
      setSuccess(true);
      addToast("Compte créé ! Vérifiez votre email pour confirmer.");
    }
  };

  if (success) {
    return (
      <div className="bg-dz-gray-50 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6"><WaselliLogo size="md" href="/" /></div>
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-dz-gray-800 mb-2">Vérifiez votre email</h2>
            <p className="text-dz-gray-500 text-sm leading-relaxed">
              Un lien de confirmation a été envoyé à <strong>{form.email}</strong>.
              Cliquez sur ce lien pour activer votre compte Waselli.
            </p>
            <p className="text-xs text-dz-gray-400 mt-4">
              Vous ne trouvez pas l&apos;email ? Vérifiez vos spams.
            </p>
            <Link href="/connexion" className="mt-6 inline-block text-dz-green font-medium hover:underline text-sm">
              Retour à la connexion →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dz-gray-50 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><WaselliLogo size="md" href="/" /></div>
          <h1 className="text-2xl font-bold text-dz-gray-800 mt-2">Créer un compte</h1>
          <p className="text-dz-gray-500 mt-1">Rejoignez la communauté Waselli</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-dz-gray-200 p-6 space-y-4">
          {error && <div className="bg-red-50 text-dz-red text-sm p-3 rounded-xl">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Prénom</label>
              <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Karim"
                className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Nom</label>
              <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Benali"
                className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">Téléphone</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-dz-gray-200 rounded-l-xl bg-dz-gray-50 text-sm text-dz-gray-500">+213</span>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="555 123 456"
                className="flex-1 px-4 py-3 border border-dz-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">Mot de passe</label>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••"
              className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            <p className="text-xs text-dz-gray-400 mt-1">Minimum 6 caractères</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">Wilaya</label>
            <select value={form.wilaya} onChange={(e) => update("wilaya", e.target.value)}
              className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700">
              <option value="">Sélectionner votre wilaya...</option>
              {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">
              Code de parrainage <span className="text-dz-gray-400 font-normal">(optionnel)</span>
            </label>
            <input type="text" value={form.referralCode} onChange={(e) => update("referralCode", e.target.value.toUpperCase())}
              placeholder="WSL-XXXX-XXX"
              className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green font-mono text-sm" />
          </div>

          <div className="bg-dz-gray-50 border border-dz-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-dz-gray-700">Acceptation des conditions</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.acceptTerms} onChange={(e) => update("acceptTerms", e.target.checked)}
                className="mt-0.5 accent-dz-green w-4 h-4 flex-shrink-0" />
              <span className="text-xs text-dz-gray-500 leading-relaxed">
                J&apos;ai lu et j&apos;accepte les{" "}
                <Link href="/cgv" className="text-dz-green underline font-medium" target="_blank">CGV</Link>,{" "}
                la <Link href="/confidentialite" className="text-dz-green underline font-medium" target="_blank">Politique de confidentialité</Link>{" "}
                et la <Link href="/mentions-legales" className="text-dz-green underline font-medium" target="_blank">Charte d&apos;utilisation</Link>.
                Je certifie avoir au moins 18 ans.
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-dz-green hover:bg-dz-green-light disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-dz-gray-500 mt-6">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-dz-green font-medium hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
