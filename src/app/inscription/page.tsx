"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/lib/context";

const WILAYAS = [
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna",
  "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira",
  "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou",
  "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
  "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine",
  "26 - Médéa", "27 - Mostaganem", "28 - M'sila", "29 - Mascara", "30 - Ouargla",
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arréridj",
  "35 - Boumerdès", "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt",
  "39 - El Oued", "40 - Khenchela", "41 - Souk Ahras", "42 - Tipaza",
  "43 - Mila", "44 - Aïn Defla", "45 - Naâma", "46 - Aïn Témouchent",
  "47 - Ghardaïa", "48 - Relizane",
];

export default function InscriptionPage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", wilaya: "", acceptTerms: false,
  });
  const [error, setError] = useState("");
  const { register, user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  if (user) {
    router.push("/tableau-de-bord");
    return null;
  }

  const update = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (!form.acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation");
      return;
    }

    const success = register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      wilaya: form.wilaya,
      password: form.password,
    });

    if (success) {
      addToast("Compte créé avec succès ! Bienvenue sur DZColis");
      router.push("/tableau-de-bord");
    } else {
      setError("Un compte existe déjà avec cet email");
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
          <h1 className="text-2xl font-bold text-dz-gray-800 mt-4">Créer un compte</h1>
          <p className="text-dz-gray-500 mt-1">Rejoignez la communauté DZColis</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-dz-gray-200 p-6 space-y-4">
          {error && <div className="bg-red-50 text-dz-red text-sm p-3 rounded-xl">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Prénom</label>
              <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Ahmed" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Nom</label>
              <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Benali" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">Téléphone</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-dz-gray-200 rounded-l-xl bg-dz-gray-50 text-sm text-dz-gray-500">+213</span>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="555 123 456" className="flex-1 px-4 py-3 border border-dz-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="votre@email.com" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">Mot de passe</label>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">Wilaya</label>
            <select value={form.wilaya} onChange={(e) => update("wilaya", e.target.value)} className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700">
              <option value="">Sélectionner votre wilaya...</option>
              {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" checked={form.acceptTerms} onChange={(e) => update("acceptTerms", e.target.checked)} className="mt-1 accent-dz-green" />
            <p className="text-xs text-dz-gray-500">
              J&apos;accepte les <a href="#" className="text-dz-green underline">conditions d&apos;utilisation</a> et la <a href="#" className="text-dz-green underline">politique de confidentialité</a>
            </p>
          </div>
          <button type="submit" className="w-full bg-dz-green hover:bg-dz-green-light text-white py-3 rounded-xl font-semibold transition-colors">
            Créer mon compte
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
