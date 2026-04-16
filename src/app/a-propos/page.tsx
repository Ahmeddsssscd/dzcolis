"use client";
import Link from "next/link";
import WaselliLogo from "@/components/WaselliLogo";
import { useI18n } from "@/lib/i18n";

export default function AProposPage() {
  const { t } = useI18n();

  const values = [
    {
      icon: "🤝",
      title: t("about_val1_title"),
      desc: t("about_val1_desc"),
    },
    {
      icon: "💚",
      title: t("about_val2_title"),
      desc: t("about_val2_desc"),
    },
    {
      icon: "💰",
      title: t("about_val3_title"),
      desc: t("about_val3_desc"),
    },
    {
      icon: "🛡️",
      title: t("about_val4_title"),
      desc: t("about_val4_desc"),
    },
  ];

  const team = [
    { avatar: "DZ", name: "À assigner ultérieurement", role: t("about_team_role1"), bio: t("about_team_bio") },
    { avatar: "DZ", name: "À assigner ultérieurement", role: t("about_team_role2"), bio: t("about_team_bio") },
  ];

  const milestones = [
    { year: "2026", event: t("about_ms1") },
    { year: "2026", event: t("about_ms2") },
    { year: "2026", event: t("about_ms3") },
    { year: "2026", event: t("about_ms4") },
  ];

  const stats = [
    { value: "50 000+", label: t("about_stat_users") },
    { value: "69", label: t("about_stat_wilayas") },
    { value: "120 000+", label: t("about_stat_parcels") },
    { value: "60%", label: t("about_stat_savings") },
  ];

  return (
    <div className="min-h-screen bg-dz-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-dz-gray-800 to-dz-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <WaselliLogo size="xl" href="/" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {t("about_hero_title")}<br />
            <span className="text-dz-green">{t("about_hero_title2")}</span>
          </h1>
          <p className="text-dz-gray-300 text-lg max-w-2xl mx-auto">
            {t("about_hero_subtitle")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-dz-green text-white py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black">{s.value}</p>
              <p className="text-green-100 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-dz-gray-900 mb-3">{t("about_story_title")}</h2>
          <p className="text-dz-gray-500">{t("about_story_subtitle")}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-8">
          <p className="text-dz-gray-700 leading-relaxed mb-4">
            {t("about_story_p1")}
          </p>
          <p className="text-dz-gray-700 leading-relaxed mb-4">
            {t("about_story_p2")}
          </p>
          <p className="text-dz-gray-700 leading-relaxed">
            {t("about_story_p3")}
          </p>
        </div>

        {/* Timeline */}
        <div className="mt-10 space-y-4">
          {milestones.map((m, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-dz-green text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {m.year}
                </div>
                {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-dz-gray-100 my-1" style={{ minHeight: 20 }} />}
              </div>
              <div className="pb-4">
                <p className="text-sm text-dz-gray-700 pt-2">{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-900 mb-3">{t("about_values_title")}</h2>
            <p className="text-dz-gray-500">{t("about_values_subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4 bg-dz-gray-50 rounded-2xl p-5 border border-dz-gray-100">
                <div className="text-3xl shrink-0">{v.icon}</div>
                <div>
                  <h3 className="font-bold text-dz-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-dz-gray-600 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-16 max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-dz-gray-900 mb-3">{t("about_team_title")}</h2>
          <p className="text-dz-gray-500">{t("about_team_subtitle")}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {team.map((member, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-8 text-center max-w-xs w-full">
              <div className="w-20 h-20 rounded-2xl bg-dz-green text-white font-black text-3xl flex items-center justify-center mx-auto mb-4">
                {member.avatar}
              </div>
              <h3 className="font-bold text-dz-gray-900 text-lg">{member.name}</h3>
              <p className="text-sm text-dz-green font-medium mt-1">{member.role}</p>
              <p className="text-sm text-dz-gray-500 mt-3 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-dz-green to-green-700 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">{t("about_cta_title")}</h2>
          <p className="text-green-100 mb-8">
            {t("about_cta_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inscription"
              className="bg-white text-dz-green font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors"
            >
              {t("about_cta_register")}
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              {t("about_cta_contact")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
