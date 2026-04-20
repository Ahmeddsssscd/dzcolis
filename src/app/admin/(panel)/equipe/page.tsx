"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

type Role = "viewer" | "support" | "moderator" | "admin" | "super_admin";

interface AdminMember {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

const ROLE_I18N_KEY: Record<Role, AdminKey> = {
  viewer: "adm_role_viewer",
  support: "adm_role_support",
  moderator: "adm_role_moderator",
  admin: "adm_role_admin",
  super_admin: "adm_role_super_admin",
};

const ROLE_DESC_KEY: Record<Role, AdminKey> = {
  viewer: "adm_eq_desc_viewer",
  support: "adm_eq_desc_support",
  moderator: "adm_eq_desc_moderator",
  admin: "adm_eq_desc_admin",
  super_admin: "adm_eq_desc_super_admin",
};

const ROLE_COLOR: Record<Role, string> = {
  viewer: "bg-gray-100 text-gray-700",
  support: "bg-blue-100 text-blue-700",
  moderator: "bg-purple-100 text-purple-700",
  admin: "bg-amber-100 text-amber-700",
  super_admin: "bg-red-100 text-red-700",
};

function formatDate(iso: string | null, lang: "fr" | "en" | "ar", neverLabel: string) {
  if (!iso) return neverLabel;
  const tag = lang === "ar" ? "ar-DZ" : lang === "en" ? "en-US" : "fr-FR";
  const d = new Date(iso);
  try {
    return d.toLocaleString(tag, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
}

export default function EquipePage() {
  const { t, lang } = useAdminT();
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [editPwdId, setEditPwdId] = useState<string | null>(null);

  // NOTE: /api/admin/me tells us who WE are, so we never offer
  // self-destructive buttons (deactivate / demote / delete yourself).
  const [meId, setMeId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<Role | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [meRes, listRes] = await Promise.all([
        fetch("/api/admin/me"),
        fetch("/api/admin/members"),
      ]);
      if (meRes.ok) {
        const me = await meRes.json();
        setMeId(me?.user?.id ?? null);
        setMyRole(me?.user?.role ?? null);
      }
      if (!listRes.ok) {
        const body = await listRes.json().catch(() => ({}));
        throw new Error(body?.error ?? "Load error");
      }
      setMembers(await listRes.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function patchMember(id: string, body: Record<string, unknown>, successMsg: string) {
    const res = await fetch(`/api/admin/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBanner(`❌ ${data?.error ?? t("adm_eq_err_generic")}`);
      return false;
    }
    setBanner(`✅ ${successMsg}`);
    await load();
    return true;
  }

  async function deleteMember(id: string, email: string) {
    if (!confirm(`${t("adm_eq_confirm_delete")}\n\n${email}`)) return;
    const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBanner(`❌ ${data?.error ?? t("adm_eq_err_generic")}`);
      return;
    }
    setBanner(`🗑️ ${email}`);
    await load();
  }

  const isSuper = myRole === "super_admin";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("adm_eq_title")}</h2>
          <p className="text-gray-500 text-sm mt-1">{t("adm_eq_subtitle")}</p>
        </div>
        {isSuper && (
          <button
            onClick={() => setShowInvite(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("adm_eq_invite")}
          </button>
        )}
      </div>

      {banner && (
        <div className="rounded-xl px-4 py-3 text-sm bg-gray-900 text-white flex items-center justify-between">
          <span>{banner}</span>
          <button onClick={() => setBanner(null)} className="text-gray-300 hover:text-white text-lg leading-none">×</button>
        </div>
      )}

      {/* Role legend */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-1 text-sm">{t("adm_eq_legend_title")}</h3>
        <p className="text-xs text-gray-500 mb-3">{t("adm_eq_legend_subtitle")}</p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {(Object.keys(ROLE_I18N_KEY) as Role[]).map((r) => (
            <div key={r} className="border border-gray-100 rounded-xl p-3">
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${ROLE_COLOR[r]}`}>
                {t(ROLE_I18N_KEY[r])}
              </span>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{t(ROLE_DESC_KEY[r])}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Members table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{t("adm_eq_members_title")} <span className="text-gray-400 font-normal">· {members.length}</span></h3>
          {!loading && (
            <button onClick={load} className="text-xs text-gray-400 hover:text-gray-600">{t("adm_jnl_refresh")}</button>
          )}
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400 text-sm">{t("adm_home_loading")}</div>
        ) : error ? (
          <div className="py-10 px-6 text-center text-red-600 text-sm">{error}</div>
        ) : members.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">{t("adm_eq_empty")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {(
                    [
                      "adm_eq_col_member",
                      "adm_eq_col_role",
                      "adm_eq_col_status",
                      "adm_eq_col_last_login",
                      "adm_eq_col_actions",
                    ] as const
                  ).map((k) => (
                    <th key={k} className="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wide">{t(k)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {members.map((m) => {
                  const isSelf = m.id === meId;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                            {(m.full_name ?? m.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {m.full_name ?? "—"}
                              {isSelf && <span className="ms-2 text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{t("adm_eq_you_tag")}</span>}
                            </p>
                            <p className="text-xs text-gray-500">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${ROLE_COLOR[m.role]}`}>
                          {t(ROLE_I18N_KEY[m.role])}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {m.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {t("adm_eq_status_active")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> {t("adm_eq_status_inactive")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(m.last_login_at, lang, t("adm_eq_last_never"))}</td>
                      <td className="px-4 py-3">
                        {isSuper && (
                          <div className="flex items-center gap-1 justify-end flex-wrap">
                            <button
                              onClick={() => setEditRoleId(m.id)}
                              className="text-xs px-2 py-1 rounded text-gray-600 hover:bg-gray-100"
                              title={t("adm_eq_act_change_role")}
                            >
                              {t("adm_eq_act_change_role")}
                            </button>
                            <button
                              onClick={() => setEditPwdId(m.id)}
                              className="text-xs px-2 py-1 rounded text-gray-600 hover:bg-gray-100"
                              title={t("adm_eq_act_reset_pwd")}
                            >
                              {t("adm_eq_act_reset_pwd")}
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() =>
                                  patchMember(
                                    m.id,
                                    { is_active: !m.is_active },
                                    m.is_active ? t("adm_eq_act_deactivate") : t("adm_eq_act_activate")
                                  )
                                }
                                className={`text-xs px-2 py-1 rounded ${
                                  m.is_active ? "text-amber-700 hover:bg-amber-50" : "text-green-700 hover:bg-green-50"
                                }`}
                              >
                                {m.is_active ? t("adm_eq_act_deactivate") : t("adm_eq_act_activate")}
                              </button>
                            )}
                            {!isSelf && (
                              <button
                                onClick={() => deleteMember(m.id, m.email)}
                                className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50"
                                title={t("adm_eq_act_delete")}
                              >
                                {t("adm_eq_act_delete")}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onDone={load} />}
      {editRoleId && (
        <RoleModal
          member={members.find((m) => m.id === editRoleId)!}
          onClose={() => setEditRoleId(null)}
          onDone={load}
        />
      )}
      {editPwdId && (
        <PasswordModal
          member={members.find((m) => m.id === editPwdId)!}
          onClose={() => setEditPwdId(null)}
          onDone={load}
        />
      )}
    </div>
  );
}

/* ─── Modals ─────────────────────────────────────────────────────── */

function ModalFrame({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InviteModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { t } = useAdminT();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("moderator");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, role, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? t("adm_eq_err_generic"));
      onDone();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("adm_eq_err_generic"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalFrame title={t("adm_eq_modal_invite_title")} onClose={onClose}>
      <p className="text-xs text-gray-500 mb-3">{t("adm_eq_modal_invite_subtitle")}</p>
      <form onSubmit={submit} className="space-y-3 text-sm">
        <Field label={t("adm_eq_modal_name")}>
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
        </Field>
        <Field label={t("adm_eq_modal_email")}>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </Field>
        <Field label={t("adm_eq_modal_role")}>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input">
            {(Object.keys(ROLE_I18N_KEY) as Role[]).map((r) => (
              <option key={r} value={r}>{t(ROLE_I18N_KEY[r])}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{t(ROLE_DESC_KEY[role])}</p>
        </Field>
        <Field label={t("adm_eq_modal_password")}>
          <input
            required
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input font-mono"
          />
        </Field>
        {err && <p className="text-red-600 bg-red-50 rounded-lg px-3 py-2 text-xs">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm">{t("adm_eq_modal_cancel")}</button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
            {saving ? t("adm_eq_saving") : t("adm_eq_modal_submit_invite")}
          </button>
        </div>
      </form>
      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
      `}</style>
    </ModalFrame>
  );
}

function RoleModal({
  member, onClose, onDone,
}: {
  member: AdminMember; onClose: () => void; onDone: () => void;
}) {
  const { t } = useAdminT();
  const [role, setRole] = useState<Role>(member.role);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? t("adm_eq_err_generic"));
      onDone();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("adm_eq_err_generic"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalFrame title={t("adm_eq_modal_role_title")} onClose={onClose}>
      <p className="text-xs text-gray-500 mb-3">
        {t("adm_eq_modal_role_subtitle")} <span className="font-medium text-gray-700">{member.full_name ?? member.email}</span>
      </p>
      <form onSubmit={submit} className="space-y-3 text-sm">
        <div className="space-y-2">
          {(Object.keys(ROLE_I18N_KEY) as Role[]).map((r) => (
            <label key={r} className={`block border rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${role === r ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${ROLE_COLOR[r]}`}>
                    {t(ROLE_I18N_KEY[r])}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{t(ROLE_DESC_KEY[r])}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
        {err && <p className="text-red-600 bg-red-50 rounded-lg px-3 py-2 text-xs">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm">{t("adm_eq_modal_cancel")}</button>
          <button type="submit" disabled={saving || role === member.role} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
            {saving ? t("adm_eq_saving") : t("adm_eq_modal_role_submit")}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

function PasswordModal({
  member, onClose, onDone,
}: {
  member: AdminMember; onClose: () => void; onDone: () => void;
}) {
  const { t } = useAdminT();
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? t("adm_eq_err_generic"));
      onDone();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("adm_eq_err_generic"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalFrame title={t("adm_eq_modal_pwd_title")} onClose={onClose}>
      <p className="text-xs text-gray-500 mb-3">{member.email}</p>
      <form onSubmit={submit} className="space-y-3 text-sm">
        <Field label={t("adm_eq_modal_pwd_new")}>
          <input
            required
            type="text"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-mono text-sm"
          />
        </Field>
        {err && <p className="text-red-600 bg-red-50 rounded-lg px-3 py-2 text-xs">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm">{t("adm_eq_modal_cancel")}</button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
            {saving ? t("adm_eq_saving") : t("adm_eq_modal_pwd_submit")}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
