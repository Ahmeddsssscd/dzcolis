import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getLivreur(id: string): Promise<any> {
  // Server-side fetch from Supabase
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.waselli.com"}/api/livreurs/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Livreur Waselli`,
    description: `Profil d'un transporteur vérifié sur Waselli.`,
  };
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-5 h-5 ${s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-sm text-dz-gray-500 ml-1">{count > 0 ? `${rating.toFixed(1)} · ${count} avis` : "Nouveau livreur"}</span>
    </div>
  );
}

export default async function LivreurProfilePage({ params }: Props) {
  // We'll fetch client-side via the directory page for now
  // This page renders the public profile shell — data loaded via API
  const id = params.id;

  return <LivreurProfileClient id={id} />;
}

// ── Client component for dynamic data ─────────────────────────────────────────
import LivreurProfileClient from "./LivreurProfileClient";
