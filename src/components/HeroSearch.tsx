"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/annonces?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-dz-gray-500 mb-1">Départ</label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Ex: Alger"
            className="w-full px-3 py-2.5 border border-dz-gray-200 rounded-xl text-dz-gray-800 focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-dz-gray-500 mb-1">Arrivée</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Ex: Oran"
            className="w-full px-3 py-2.5 border border-dz-gray-200 rounded-xl text-dz-gray-800 focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full bg-dz-green hover:bg-dz-green-light text-white text-center py-2.5 rounded-xl font-medium transition-colors"
          >
            Rechercher
          </button>
        </div>
      </div>
    </div>
  );
}
