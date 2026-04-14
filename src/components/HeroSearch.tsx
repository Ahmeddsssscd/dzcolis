"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WILAYAS } from "@/lib/wilayas";

function WilayaSelect({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? WILAYAS.filter((w) => w.toLowerCase().includes(query.toLowerCase()))
    : WILAYAS;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(wilaya: string) {
    onChange(wilaya);
    setOpen(false);
    setQuery("");
  }

  function handleOpen() {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-dz-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-2 px-3.5 py-3 border border-dz-gray-200 rounded-xl bg-white text-left hover:border-dz-green/50 focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green transition-colors"
      >
        <span className="text-dz-green shrink-0">{icon}</span>
        <span className={`flex-1 text-sm truncate ${value ? "text-dz-gray-800 font-medium" : "text-dz-gray-400"}`}>
          {value || placeholder}
        </span>
        <svg className={`w-4 h-4 text-dz-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-dz-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-dz-gray-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une wilaya..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-dz-gray-50 border border-dz-gray-200 rounded-lg focus:outline-none focus:border-dz-green"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-dz-gray-400 py-4">Aucune wilaya trouvée</p>
            ) : (
              filtered.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => select(w)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-dz-green/5 hover:text-dz-green transition-colors flex items-center justify-between ${
                    value === w ? "bg-dz-green/5 text-dz-green font-medium" : "text-dz-gray-700"
                  }`}
                >
                  {w}
                  {value === w && (
                    <svg className="w-4 h-4 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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

  const swap = () => {
    const tmp = from;
    setFrom(to);
    setTo(tmp);
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-2xl max-w-2xl w-full">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end">
        <WilayaSelect
          label="Départ"
          value={from}
          onChange={setFrom}
          placeholder="Choisir une wilaya"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        <button
          type="button"
          onClick={swap}
          className="hidden md:flex w-9 h-9 items-center justify-center rounded-full border border-dz-gray-200 hover:border-dz-green hover:text-dz-green text-dz-gray-400 transition-colors mb-0.5"
          title="Inverser"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <WilayaSelect
          label="Arrivée"
          value={to}
          onChange={setTo}
          placeholder="Choisir une wilaya"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          }
        />

        <button
          onClick={handleSearch}
          className="bg-dz-green hover:bg-dz-green-light text-white px-6 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap text-sm flex items-center gap-2 justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          Chercher
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-dz-gray-400 self-center">Populaires :</span>
        {[
          { from: "Alger", to: "Oran" },
          { from: "Alger", to: "Constantine" },
          { from: "Alger", to: "Béjaïa" },
          { from: "Oran", to: "Tlemcen" },
        ].map((r) => (
          <button
            key={`${r.from}-${r.to}`}
            onClick={() => { setFrom(r.from); setTo(r.to); }}
            className="text-xs bg-dz-gray-50 hover:bg-dz-green/5 hover:text-dz-green border border-dz-gray-200 hover:border-dz-green/30 text-dz-gray-600 px-3 py-1.5 rounded-full transition-colors"
          >
            {r.from} → {r.to}
          </button>
        ))}
      </div>
    </div>
  );
}
