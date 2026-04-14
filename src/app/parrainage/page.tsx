"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useToast, type User } from "@/lib/context";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Copiez votre code",
    desc: "Partagez votre code de parrainage unique avec vos amis et votre famille.",
  },
  {
    step: "2",
    title: "Ils s'inscrivent",
    desc: "Votre filleul s'inscrit sur DZColis et entre votre code lors de l'inscription.",
  },
  {
    step: "3",
    title: "Vous gagnez tous les deux",
    desc: "Recevez 500 DA de crédit dès que votre filleul complète sa première expédition.",
  },
];

export default function ParrainagePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [referredUsers, setReferredUsers] = useState<User[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const allUsers = loadFromStorage<(User & { password: string })[]>("dzcolis_users", []);
    const referred = allUsers
      .filter((u) => u.referredBy === user.referralCode)
      .map(({ password: _, ...rest }) => {
        void _;
        return rest as User;
      });
    setReferredUsers(referred);
  }, [user]);

  useEffect(() => {
    if (!user) router.push("/connexion");
  }, [user, router]);

  if (!user) return null;

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/inscription?ref=${user.referralCode}`
    : `https://dzcolis.com/inscription?ref=${user.referralCode}`;

  const totalCredit = referredUsers.length * 500;

  function copyCode() {
    navigator.clipboard.writeText(user!.referralCode).then(() => {
      setCopied(true);
      addToast("Code de parrainage copié !");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      addToast("Lien de parrainage copié !");
    });
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `Rejoins DZColis — la plateforme collaborative d'envoi de colis en Algérie ! Utilise mon code ${user!.referralCode} à l'inscription pour obtenir 500 DA de crédit offert : ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link href="/tableau-de-bord" className="inline-flex items-center gap-2 text-sm text-dz-gray-500 hover:text-dz-green mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Tableau de bord
          </Link>
          <h1 className="text-3xl font-bold text-dz-gray-800">Programme de parrainage</h1>
          <p className="text-dz-gray-500 mt-1">Invitez vos proches et gagnez 500 DA par filleul</p>
        </div>

        {/* Credit earned banner */}
        {referredUsers.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-800">
                Vous avez parrainé {referredUsers.length} personne{referredUsers.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-green-600 mt-0.5">Crédit total gagné : {totalCredit.toLocaleString()} DA</p>
            </div>
            <div className="text-3xl font-bold text-green-600">{totalCredit.toLocaleString()} DA</div>
          </div>
        )}

        {/* Referral code card */}
        <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 mb-6">
          <p className="text-xs font-semibold text-dz-gray-500 uppercase tracking-wide mb-3">Votre code de parrainage</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-dz-gray-50 border-2 border-dashed border-dz-gray-200 rounded-xl px-6 py-4 text-center">
              <span className="text-2xl font-bold tracking-widest text-dz-gray-800 font-mono">
                {user.referralCode}
              </span>
            </div>
            <button
              onClick={copyCode}
              className={`shrink-0 px-5 py-4 rounded-xl font-semibold text-sm transition-all ${
                copied
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-dz-green text-white hover:opacity-90"
              }`}
            >
              {copied ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copié
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copier
                </span>
              )}
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 text-sm font-medium border border-dz-gray-200 hover:border-dz-green/40 text-dz-gray-700 px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Copier le lien
            </button>
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 text-sm font-medium bg-[#25D366] hover:opacity-90 text-white px-4 py-2.5 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Partager sur WhatsApp
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-bold text-dz-gray-800 mb-5">Comment ça marche ?</h2>
          <div className="space-y-5">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-dz-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-dz-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-dz-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reward details */}
        <div className="bg-dz-gray-50 border border-dz-gray-200 rounded-2xl p-5 mb-6">
          <h2 className="text-base font-bold text-dz-gray-800 mb-3">Détails des récompenses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-dz-gray-200 p-4">
              <p className="text-xs text-dz-gray-500 mb-1">Vous recevez</p>
              <p className="text-2xl font-bold text-dz-green">500 DA</p>
              <p className="text-xs text-dz-gray-400 mt-0.5">par filleul actif</p>
            </div>
            <div className="bg-white rounded-xl border border-dz-gray-200 p-4">
              <p className="text-xs text-dz-gray-500 mb-1">Votre filleul reçoit</p>
              <p className="text-2xl font-bold text-dz-green">500 DA</p>
              <p className="text-xs text-dz-gray-400 mt-0.5">à son inscription</p>
            </div>
          </div>
          <p className="text-xs text-dz-gray-400 mt-4">
            * Le crédit est versé dès que votre filleul complète sa première expédition sur DZColis. Les crédits sont valables 12 mois.
          </p>
        </div>

        {/* Referred users list */}
        <div className="bg-white border border-dz-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-dz-gray-800">Mes filleuls</h2>
            <span className="text-xs font-semibold bg-dz-gray-100 text-dz-gray-600 px-2.5 py-1 rounded-full">
              {referredUsers.length} filleul{referredUsers.length !== 1 ? "s" : ""}
            </span>
          </div>

          {referredUsers.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-dz-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-dz-gray-500 text-sm font-medium">Aucun filleul pour le moment</p>
              <p className="text-dz-gray-400 text-xs mt-1">Partagez votre code pour commencer à gagner</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referredUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-dz-gray-50">
                  <div className="w-9 h-9 rounded-full bg-dz-green flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dz-gray-800">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-dz-gray-400">
                      Inscrit le {new Date(u.createdAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                      +500 DA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
