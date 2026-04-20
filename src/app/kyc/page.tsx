"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useToast } from "@/lib/context";
import { createClient } from "@/lib/supabase/client";

interface UploadedFile { name: string; size: string; file: File; }

export default function KycPage() {
  const { user, authLoading, refreshUser } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [cinFront, setCinFront] = useState<UploadedFile | null>(null);
  const [cinBack, setCinBack]   = useState<UploadedFile | null>(null);
  const [selfie, setSelfie]     = useState<UploadedFile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cinFrontRef = useRef<HTMLInputElement>(null);
  const cinBackRef  = useRef<HTMLInputElement>(null);
  const selfieRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/connexion"); return; }
  }, [user, authLoading, router]);

  if (authLoading) return (
    <div className="min-h-screen bg-dz-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-dz-green border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  const kycStatus = user.kycStatus ?? "none";

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  }

  function handleFileSelect(file: File | undefined, setter: (f: UploadedFile | null) => void) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { addToast("Fichier trop volumineux (max 10 MB)", "error"); return; }
    setter({ name: file.name, size: formatSize(file.size), file });
  }

  async function uploadToStorage(file: File, path: string): Promise<string | null> {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { error } = await db.storage.from("kyc-documents").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) { console.error("Storage upload error:", error); return null; }
    return path;
  }

  async function handleSubmit() {
    if (!cinFront || !cinBack || !selfie) {
      addToast("Veuillez uploader tous les documents requis", "error"); return;
    }
    setSubmitting(true);

    try {
      if (!user) { setSubmitting(false); return; }
      const userId = user.id;
      const timestamp = Date.now();

      // Upload all 3 files to Supabase Storage
      const [frontPath, backPath, selfiePath] = await Promise.all([
        uploadToStorage(cinFront.file,  `${userId}/cin-front-${timestamp}`),
        uploadToStorage(cinBack.file,   `${userId}/cin-back-${timestamp}`),
        uploadToStorage(selfie.file,    `${userId}/selfie-${timestamp}`),
      ]);

      if (!frontPath || !backPath || !selfiePath) {
        addToast("Erreur lors de l'upload des fichiers. Réessayez.", "error");
        setSubmitting(false);
        return;
      }

      // Upsert kyc_documents record (single row per user)
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { error: dbError } = await db.from("kyc_documents").upsert({
        user_id: userId,
        cin_recto_url: frontPath,
        cin_verso_url: backPath,
        selfie_url: selfiePath,
        status: "submitted",
      }, { onConflict: "user_id" });

      if (dbError) {
        addToast("Erreur lors de l'enregistrement. Réessayez.", "error");
        setSubmitting(false);
        return;
      }

      // Update profile kyc_status to "submitted"
      await db.from("profiles").update({ kyc_status: "submitted" }).eq("id", userId);

      await refreshUser();
      addToast("Documents soumis avec succès ! Vérification sous 24h.");
    } catch (err) {
      console.error("KYC submit error:", err);
      addToast("Une erreur s'est produite. Réessayez.", "error");
    }
    setSubmitting(false);
  }

  const UploadZone = ({
    label, sub, file, inputRef, onChange,
  }: {
    label: string; sub: string; file: UploadedFile | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (f: File | undefined) => void;
  }) => (
    <div>
      <p className="text-sm font-semibold text-dz-gray-700 mb-2">{label}</p>
      <p className="text-xs text-dz-gray-400 mb-3">{sub}</p>
      <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden"
        onChange={e => onChange(e.target.files?.[0])} />
      {file ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dz-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-dz-gray-400">{file.size}</p>
          </div>
          <button onClick={() => onChange(undefined)} className="text-xs text-red-500 hover:text-red-700 font-medium">Changer</button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-dz-gray-200 hover:border-dz-green/40 hover:bg-dz-green/5 rounded-xl p-6 text-center transition-all group">
          <svg className="w-8 h-8 text-dz-gray-300 group-hover:text-dz-green mx-auto mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-dz-gray-500 group-hover:text-dz-green">Cliquer pour uploader</p>
          <p className="text-xs text-dz-gray-400 mt-0.5">JPG, PNG ou PDF · Max 10 MB</p>
        </button>
      )}
    </div>
  );

  // ── Status screens ──
  if (kycStatus === "submitted" || kycStatus === "reviewing") {
    return (
      <div className="bg-dz-gray-50 min-h-screen flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-dz-gray-800 mb-2">En cours de vérification</h1>
          <p className="text-dz-gray-500 text-sm mb-6">Votre dossier a bien été reçu. Notre équipe le vérifie sous <strong>24 heures ouvrables</strong>.</p>
          <div className="bg-white border border-dz-gray-200 rounded-2xl p-5 mb-6 text-left space-y-3">
            {[
              { label: "Documents soumis", done: true, active: false },
              { label: "Vérification en cours", done: false, active: true },
              { label: "Compte activé", done: false, active: false },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.done ? "bg-green-500" : step.active ? "bg-amber-400 animate-pulse" : "bg-dz-gray-200"
                }`}>
                  {step.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  {step.active && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className={`text-sm ${step.active ? "font-medium text-dz-gray-700" : step.done ? "text-dz-gray-700" : "text-dz-gray-400"}`}>{step.label}</span>
              </div>
            ))}
          </div>
          <Link href="/tableau-de-bord" className="block text-center bg-dz-green hover:opacity-90 text-white py-3.5 rounded-xl font-semibold transition-opacity">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (kycStatus === "approved") {
    return (
      <div className="bg-dz-gray-50 min-h-screen flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-dz-gray-800 mb-2">Identité vérifiée !</h1>
          <p className="text-dz-gray-500 text-sm mb-6">Votre compte est entièrement vérifié. Vous pouvez maintenant transporter des colis.</p>
          <Link href="/tableau-de-bord" className="block text-center bg-dz-green hover:opacity-90 text-white py-3.5 rounded-xl font-semibold transition-opacity">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (kycStatus === "rejected") {
    return (
      <div className="bg-dz-gray-50 min-h-screen flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-dz-gray-800 mb-2">Documents refusés</h1>
          <p className="text-dz-gray-500 text-sm mb-6">Vos documents n&apos;ont pas pu être validés. Veuillez soumettre de nouveaux documents clairs et lisibles.</p>
          <button onClick={() => refreshUser()} className="w-full bg-dz-green hover:opacity-90 text-white py-3.5 rounded-xl font-semibold transition-opacity mb-3">
            Resoumettre mes documents
          </button>
          <Link href="/tableau-de-bord" className="block text-center text-dz-gray-500 text-sm hover:text-dz-green">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  // ── Upload form ──
  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">

        <Link href="/tableau-de-bord" className="inline-flex items-center gap-2 text-sm text-dz-gray-500 hover:text-dz-green mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tableau de bord
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dz-gray-800">Vérification d&apos;identité</h1>
          <p className="text-dz-gray-500 text-sm mt-1">Requis pour proposer des trajets et transporter des colis.</p>
        </div>

        <div className="bg-dz-green/5 border border-dz-green/20 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-bold text-dz-gray-800 mb-3">Pourquoi se vérifier ?</h2>
          <ul className="space-y-2">
            {[
              "Accéder aux formules d'assurance Standard et Premium",
              "Augmenter votre Score de Confiance Waselli",
              "Publier des annonces de trajet en tant que transporteur",
              "Rassurer les expéditeurs et obtenir plus de réservations",
            ].map(b => (
              <li key={b} className="flex items-start gap-2 text-sm text-dz-gray-700">
                <svg className="w-4 h-4 text-dz-green mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 space-y-6 mb-4">
          <h2 className="text-base font-bold text-dz-gray-800">Documents requis</h2>

          <UploadZone label="Carte Nationale d'Identité — Recto *" sub="Photo nette de la face avant de votre CIN"
            file={cinFront} inputRef={cinFrontRef} onChange={f => handleFileSelect(f, setCinFront)} />
          <div className="border-t border-dz-gray-100" />
          <UploadZone label="Carte Nationale d'Identité — Verso *" sub="Photo nette de la face arrière de votre CIN"
            file={cinBack} inputRef={cinBackRef} onChange={f => handleFileSelect(f, setCinBack)} />
          <div className="border-t border-dz-gray-100" />
          <UploadZone label="Selfie avec votre CIN *" sub="Tenez votre CIN à côté de votre visage, les deux doivent être clairement visibles"
            file={selfie} inputRef={selfieRef} onChange={f => handleFileSelect(f, setSelfie)} />
        </div>

        <div className="bg-dz-gray-50 border border-dz-gray-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-dz-gray-500 leading-relaxed">
            Vos documents sont chiffrés et traités conformément à la loi algérienne n° 18-07 relative à la protection des données personnelles.
          </p>
        </div>

        <button onClick={handleSubmit} disabled={submitting || !cinFront || !cinBack || !selfie}
          className="w-full bg-dz-green hover:opacity-90 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
          {submitting ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Upload en cours...</>
          ) : "Soumettre mes documents"}
        </button>

      </div>
    </div>
  );
}
