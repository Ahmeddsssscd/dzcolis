"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useListings, useToast } from "@/lib/context";
import { useI18n } from "@/lib/i18n";
import { ALGERIAN_CITIES } from "@/lib/data";
import Link from "next/link";

export default function TransporterPage() {
  const { user } = useAuth();
  const { addListing } = useListings();
  const { addToast } = useToast();
  const { t } = useI18n();
  const router = useRouter();

  const [form, setForm] = useState({
    from: "", to: "", date: "", vehicle: "car", maxWeight: "", price: "", description: "", recurring: false,
  });
  const [calcWeight, setCalcWeight] = useState("10");
  const [calcPrice, setCalcPrice] = useState("500");

  const update = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  const calcEarnings = Math.round(
    (parseFloat(calcWeight) || 0) * (parseFloat(calcPrice) || 0) * 0.9
  );

  const vehicleOptions = [
    { key: "car",    icon: "🚗", label: t("trans_vehicle_car") },
    { key: "van",    icon: "🚐", label: t("trans_vehicle_van") },
    { key: "pickup", icon: "🛻", label: t("trans_vehicle_pickup") },
    { key: "truck",  icon: "🚛", label: t("trans_vehicle_truck") },
  ];

  if (!user) {
    return (
      <div className="bg-dz-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-dz-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-dz-gray-800 mb-2">{t("trans_login_title")}</h2>
          <p className="text-dz-gray-500 mb-6">{t("trans_login_desc")}</p>
          <Link href="/connexion" className="bg-dz-green hover:bg-dz-green-light text-white px-6 py-3 rounded-xl font-medium transition-colors">{t("trans_login_btn")}</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.price) {
      addToast(t("trans_error_required"), "error");
      return;
    }

    const vehicleLabel = vehicleOptions.find((v) => v.key === form.vehicle)?.label ?? form.vehicle;

    const result = await addListing({
      user_id: user.id,
      from_city: form.from,
      to_city: form.to,
      departure_date: form.date || new Date().toISOString().split("T")[0],
      arrival_date: null,
      price_per_kg: parseInt(form.price),
      available_weight: parseFloat(form.maxWeight) || 0,
      description: form.description || `${vehicleLabel} disponible. ${form.recurring ? "Trajet régulier." : ""}`,
      is_international: false,
      listing_type: "trajet",
    });

    if (result) {
      addToast(t("trans_success"));
      router.push("/annonces");
    } else {
      addToast(t("trans_error_pub"), "error");
    }
  };

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dz-gray-800">{t("trans_page_title")}</h1>
          <p className="text-dz-gray-500 mt-2">{t("trans_page_subtitle")}</p>
        </div>

        <div className="bg-gradient-to-r from-dz-green to-dz-green-light text-white rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-lg mb-1">{t("trans_calc_title")}</h3>
          <p className="text-green-100 text-sm mb-4">{t("trans_calc_subtitle")}</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-green-200 mb-1">{t("trans_calc_weight")}</label>
              <input
                type="number"
                min="1"
                max="500"
                value={calcWeight}
                onChange={(e) => setCalcWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-green-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-green-200 mb-1">{t("trans_calc_price")}</label>
              <input
                type="number"
                min="50"
                max="5000"
                value={calcPrice}
                onChange={(e) => setCalcPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-green-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              />
            </div>
          </div>
          <div className="bg-white/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-green-200">{t("trans_calc_earnings")}</div>
              <div className="text-3xl font-bold mt-0.5">{calcEarnings.toLocaleString("fr-DZ")} DA</div>
            </div>
            <div className="text-right text-xs text-green-200 space-y-1">
              <div>{t("trans_calc_wilayas")}</div>
              <div>{t("trans_calc_avail")}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
              {t("trans_step1")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">{t("trans_from")}</label>
                <select value={form.from} onChange={(e) => update("from", e.target.value)} className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700">
                  <option value="">{t("trans_select")}</option>
                  {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">{t("trans_to")}</label>
                <select value={form.to} onChange={(e) => update("to", e.target.value)} className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700">
                  <option value="">{t("trans_select")}</option>
                  {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">{t("trans_date")}</label>
              <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700" />
            </div>
            <label className="flex items-center gap-2 text-sm text-dz-gray-700 mt-4">
              <input type="checkbox" checked={form.recurring} onChange={(e) => update("recurring", e.target.checked)} className="accent-dz-green" />
              {t("trans_recurring")}
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
              {t("trans_step2")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {vehicleOptions.map((v) => (
                <label key={v.key} className={`border rounded-xl p-4 text-center cursor-pointer transition-colors ${form.vehicle === v.key ? "border-dz-green bg-dz-green/5" : "border-dz-gray-200 hover:border-dz-green/30"}`}>
                  <input type="radio" name="vehicle" value={v.key} checked={form.vehicle === v.key} onChange={(e) => update("vehicle", e.target.value)} className="sr-only" />
                  <div className="text-2xl mb-1">{v.icon}</div>
                  <div className="text-sm font-medium text-dz-gray-700">{v.label}</div>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">{t("trans_max_weight")}</label>
              <input type="number" value={form.maxWeight} onChange={(e) => update("maxWeight", e.target.value)} placeholder="Ex: 100" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">3</span>
              {t("trans_step3")}
            </h2>
            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">{t("trans_min_price")}</label>
              <input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="Ex: 1500" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">{t("trans_desc_notes")}</label>
              <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Ex: Grand espace disponible..." className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green resize-none" />
            </div>
          </div>

          <button type="submit" className="w-full bg-dz-green hover:bg-dz-green-light text-white py-4 rounded-xl font-semibold text-lg transition-colors">
            {t("trans_submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
