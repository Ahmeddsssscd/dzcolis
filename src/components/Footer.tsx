"use client";
import Link from "next/link";
import WaselliLogo from "@/components/WaselliLogo";
import { useI18n } from "@/lib/i18n";

/**
 * Footer design notes:
 * — Dark background is intentional — it creates a clear "end of page"
 *   signal and gives visual rest after long content.
 * — Columns get breathing room. Old footer's line-height felt cramped.
 * — Column headers are uppercased + tracked, body links are larger.
 *   That's the hierarchy trick; without it everything feels like one
 *   long list.
 * — Social row is a defined block at the top of Contact, not a squeezed
 *   afterthought under the WhatsApp button.
 */
export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-dz-gray-900 text-dz-gray-300 relative overflow-hidden">
      {/* Soft brand glow in one corner — subtle depth, nothing loud */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full opacity-[0.08]"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 60%)" }}
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto container-px py-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-y-10 md:gap-x-8">
          {/* ── Brand ─── */}
          <div className="col-span-2 md:col-span-4">
            <div className="mb-4">
              <WaselliLogo size="sm" href="/" />
            </div>
            <p className="text-sm leading-relaxed text-dz-gray-400 max-w-sm">
              {t("footer_tagline")}
            </p>

            {/* Social */}
            <div className="flex items-center gap-2 mt-6">
              <SocialLink
                href="https://facebook.com/waselli"
                label="Facebook Waselli"
                hoverBg="#1877F2"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </SocialLink>
              <SocialLink
                href="https://instagram.com/wasellidz"
                label="Instagram Waselli"
                hoverBg="linear-gradient(135deg,#833ab4,#fd1d1d 70%,#fcb045)"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </SocialLink>
              <SocialLink
                href="https://twitter.com/waselli"
                label="X (Twitter) Waselli"
                hoverBg="#000"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </SocialLink>
              <SocialLink
                href="https://wa.me/40725028189?text=Bonjour%20Waselli%2C%20j%27ai%20besoin%20d%27aide."
                label="WhatsApp Waselli"
                hoverBg="#25D366"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </SocialLink>
            </div>
          </div>

          {/* ── Services ─── */}
          <FooterColumn title={t("footer_services")}>
            <FooterLink href="/envoyer">{t("footer_send")}</FooterLink>
            <FooterLink href="/transporter">{t("footer_become")}</FooterLink>
            <FooterLink href="/annonces">{t("footer_marketplace")}</FooterLink>
            <FooterLink href="/international">{t("footer_intl")}</FooterLink>
            <FooterLink href="/solutions-business">{t("footer_business")}</FooterLink>
          </FooterColumn>

          {/* ── Info ─── */}
          <FooterColumn title={t("footer_info")}>
            <FooterLink href="/comment-ca-marche">{t("footer_how")}</FooterLink>
            <FooterLink href="/tarifs">{t("footer_pricing")}</FooterLink>
            <FooterLink href="/assurance">{t("footer_insurance")}</FooterLink>
            <FooterLink href="/suivi">{t("footer_tracking")}</FooterLink>
            <FooterLink href="/conseils-emballage">{t("footer_packaging")}</FooterLink>
            <FooterLink href="/faq">{t("footer_faq")}</FooterLink>
          </FooterColumn>

          {/* ── Contact ─── */}
          <FooterColumn title={t("footer_contact")}>
            {/* Real mailto — clicking actually opens the mail client. The
                previous Link to /contact made the address look like a
                button, not an e-mail. */}
            <li>
              <a
                href="mailto:contact@waselli.com"
                className="text-sm text-dz-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@waselli.com
              </a>
            </li>
            <FooterLink href="/contact">{t("footer_contact_form") || "Formulaire de contact"}</FooterLink>
            <li className="text-sm text-dz-gray-400">Alger, Algérie</li>
            <FooterLink href="/a-propos">{t("footer_about")}</FooterLink>

            <li className="pt-3">
              <a
                href="https://wa.me/40725028189?text=Bonjour%20Waselli%2C%20j%27ai%20besoin%20d%27aide."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20B954] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t("footer_whatsapp")}
              </a>
            </li>
          </FooterColumn>
        </div>

        {/* ── Support strip ─────────────────────────────────────────
             Sits above the legal bar on every page so the support
             e-mail is one click away without forcing users to open
             the contact form. */}
        <div className="border-t border-dz-gray-800 mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-sm text-dz-gray-400">
            {t("footer_support_prefix") || "Besoin d'aide ? Écrivez-nous à"}{" "}
            <a href="mailto:contact@waselli.com" className="font-semibold text-white hover:text-dz-green transition-colors">
              contact@waselli.com
            </a>
          </p>
          <a
            href="mailto:contact@waselli.com?subject=Support%20Waselli"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {t("footer_support_cta") || "Contacter le support"}
          </a>
        </div>

        {/* ── Bottom bar ─── */}
        <div className="border-t border-dz-gray-800 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-dz-gray-500">{t("footer_rights")}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            <Link href="/mentions-legales" className="text-dz-gray-500 hover:text-white transition-colors">{t("footer_legal")}</Link>
            <Link href="/cgv" className="text-dz-gray-500 hover:text-white transition-colors">{t("footer_terms")}</Link>
            <Link href="/confidentialite" className="text-dz-gray-500 hover:text-white transition-colors">{t("footer_privacy")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="md:col-span-3 lg:col-span-2 lg:col-start-auto">
      <h3 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-dz-gray-400 mb-4">
        {title}
      </h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-dz-gray-400 hover:text-white transition-colors">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  label,
  hoverBg,
  children,
}: {
  href: string;
  label: string;
  hoverBg: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-dz-gray-800 hover:bg-[--hover] text-dz-gray-300 hover:text-white"
      style={{ ["--hover" as string]: hoverBg }}
    >
      {children}
    </a>
  );
}
