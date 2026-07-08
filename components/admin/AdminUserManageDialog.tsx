"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Sparkles, UserPlus, X } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { describeRoleSlug } from "@/lib/admin/role-descriptions";
import { invitableRoleSlugs } from "@/lib/auth/invite-permissions";
import type { AdminRoleSlug } from "@/lib/auth/types";
import { isActiveRoleSlug } from "@/lib/admin/roles";

export interface UserManageRole {
  id: string;
  slug: string;
  label: string;
}

type ManageTab = "invite" | "manual";

interface AdminUserManageDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inviterRole: AdminRoleSlug;
  roles: UserManageRole[];
  canInvite: boolean;
  canCreateManually: boolean;
  defaultTab?: ManageTab;
  toast: (message: string, type?: "success" | "error") => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

const emptyInvite = () => ({
  firstName: "",
  lastName: "",
  email: "",
  roleId: "",
  message: "",
});

const emptyManual = () => ({
  firstName: "",
  lastName: "",
  email: "",
  roleId: "",
  password: "",
  useGeneratedPassword: true,
  mustChangePassword: true,
  require2fa: true,
  sendWelcomeEmail: true,
});

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  for (const byte of bytes) {
    out += chars[byte % chars.length];
  }
  return out;
}

export function AdminUserManageDialog({
  open,
  onClose,
  onSuccess,
  inviterRole,
  roles,
  canInvite,
  canCreateManually,
  defaultTab = "invite",
  toast,
  withLoading,
}: AdminUserManageDialogProps) {
  const allowedRoles = useMemo(() => {
    const slugs = invitableRoleSlugs(inviterRole);
    return roles.filter((r) => isActiveRoleSlug(r.slug) && slugs.includes(r.slug));
  }, [inviterRole, roles]);

  const [tab, setTab] = useState<ManageTab>(defaultTab);
  const [inviteForm, setInviteForm] = useState(emptyInvite);
  const [manualForm, setManualForm] = useState(emptyManual);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTab(canInvite ? defaultTab : "manual");
    setLastInviteUrl(null);
    if (allowedRoles.length) {
      setInviteForm((f) => ({ ...f, roleId: f.roleId || allowedRoles[0]!.id }));
      setManualForm((f) => ({ ...f, roleId: f.roleId || allowedRoles[0]!.id }));
    }
  }, [open, defaultTab, canInvite, allowedRoles]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const selectedRole = allowedRoles.find((r) => r.id === (tab === "invite" ? inviteForm.roleId : manualForm.roleId));

  const sendInvite = async () => {
    if (!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email || !inviteForm.roleId) {
      return toast("Bitte Vorname, Nachname, E-Mail und Rolle ausfüllen.", "error");
    }
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inviteForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Einladung fehlgeschlagen");
        setLastInviteUrl(data.inviteUrl ?? null);
        if (data.emailSent) {
          toast("E-Mail erfolgreich versendet.");
        } else {
          toast(
            data.emailError
              ? `E-Mail konnte nicht versendet werden. ${data.emailError}`
              : "Einladung erstellt, E-Mail konnte nicht versendet werden.",
            "error",
          );
        }
        setInviteForm(emptyInvite());
        if (allowedRoles[0]) {
          setInviteForm({ ...emptyInvite(), roleId: allowedRoles[0]!.id });
        }
        onSuccess();
      })(),
    );
  };

  const createManual = async () => {
    if (!manualForm.firstName || !manualForm.lastName || !manualForm.email || !manualForm.roleId) {
      return toast("Bitte Vorname, Nachname, E-Mail und Rolle ausfüllen.", "error");
    }
    const password = manualForm.useGeneratedPassword ? generatePassword() : manualForm.password;
    if (!password || password.length < 8) {
      return toast("Passwort muss mindestens 8 Zeichen haben.", "error");
    }
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: manualForm.firstName,
            lastName: manualForm.lastName,
            email: manualForm.email,
            roleId: manualForm.roleId,
            password,
            mustChangePassword: manualForm.mustChangePassword,
            require2fa: manualForm.require2fa,
            sendWelcomeEmail: manualForm.sendWelcomeEmail,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Benutzer konnte nicht angelegt werden");
        if (manualForm.sendWelcomeEmail && data.welcomeEmailSent === false) {
          toast(
            data.welcomeEmailError
              ? `E-Mail konnte nicht versendet werden. ${data.welcomeEmailError}`
              : "Benutzer angelegt, Willkommens-E-Mail konnte nicht versendet werden.",
            "error",
          );
        } else if (manualForm.sendWelcomeEmail && data.welcomeEmailSent) {
          toast(
            manualForm.useGeneratedPassword
              ? `Benutzer angelegt. E-Mail erfolgreich versendet. Temporäres Passwort: ${password}`
              : "Benutzer angelegt. E-Mail erfolgreich versendet.",
          );
        } else {
          toast(
            manualForm.useGeneratedPassword
              ? `Benutzer angelegt. Temporäres Passwort: ${password}`
              : "Benutzer angelegt.",
          );
        }
        setManualForm(emptyManual());
        if (allowedRoles[0]) {
          setManualForm({ ...emptyManual(), roleId: allowedRoles[0]!.id });
        }
        onSuccess();
        onClose();
      })(),
    );
  };

  return (
    <div className="admin-user-manage-root" role="dialog" aria-modal="true" aria-label="Benutzer verwalten">
      <button type="button" className="admin-user-manage-backdrop" onClick={onClose} aria-label="Schließen" />
      <div className="admin-user-manage-panel">
        <div className="admin-user-manage-header">
          <div>
            <h2 className="font-heading text-xl font-bold text-text-primary">Benutzer hinzufügen</h2>
            <p className="mt-1 text-sm text-text-muted">Einladung per Link (empfohlen) oder manuelle Anlage</p>
          </div>
          <button type="button" className="admin-user-manage-close" onClick={onClose} aria-label="Dialog schließen">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="admin-user-manage-tabs" role="tablist" aria-label="Anlegemethode">
          {canInvite ? (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "invite"}
              className={`admin-user-manage-tab ${tab === "invite" ? "is-active" : ""}`}
              onClick={() => setTab("invite")}
            >
              <Mail className="h-4 w-4" aria-hidden />
              Benutzer einladen
              <AdminStatusBadge label="Empfohlen" variant="success" />
            </button>
          ) : null}
          {canCreateManually ? (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "manual"}
              className={`admin-user-manage-tab ${tab === "manual" ? "is-active" : ""}`}
              onClick={() => setTab("manual")}
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              Manuell erstellen
            </button>
          ) : null}
        </div>

        {tab === "invite" && canInvite ? (
          <div className="admin-user-manage-body">
            <p className="admin-user-manage-hint">
              Der eingeladene Benutzer erhält einen Link, richtet Passwort und verpflichtende 2FA selbst ein.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminFormField label="Vorname" required>
                <input
                  className="admin-input"
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                />
              </AdminFormField>
              <AdminFormField label="Nachname" required>
                <input
                  className="admin-input"
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                />
              </AdminFormField>
              <AdminFormField label="E-Mail" required className="sm:col-span-2">
                <input
                  className="admin-input"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                />
              </AdminFormField>
              <AdminFormField label="Rolle" required>
                <select
                  className="admin-input"
                  value={inviteForm.roleId}
                  onChange={(e) => setInviteForm({ ...inviteForm, roleId: e.target.value })}
                >
                  {allowedRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {selectedRole ? (
                  <p className="mt-2 text-xs text-text-muted">{describeRoleSlug(selectedRole.slug)}</p>
                ) : null}
              </AdminFormField>
              <AdminFormField label="Optionale Nachricht" hint="Wird in der Einladungs-E-Mail angezeigt." className="sm:col-span-2">
                <textarea
                  className="admin-input min-h-24"
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                />
              </AdminFormField>
            </div>
            {lastInviteUrl ? (
              <div className="admin-user-manage-link-box">
                <p className="text-sm font-medium text-text-primary">Einladungslink (zuletzt erstellt)</p>
                <code className="mt-2 block break-all text-xs text-text-muted">{lastInviteUrl}</code>
                <AdminButton
                  variant="secondary"
                  className="mt-3"
                  onClick={() => {
                    void navigator.clipboard.writeText(lastInviteUrl);
                    toast("Link kopiert.");
                  }}
                >
                  Link kopieren
                </AdminButton>
              </div>
            ) : null}
            <div className="admin-user-manage-actions">
              <AdminButton variant="primary" icon={<Mail className="h-4 w-4" />} onClick={() => void sendInvite()}>
                Einladung senden
              </AdminButton>
              <AdminButton variant="secondary" onClick={onClose}>
                {ADMIN_BTN.cancel}
              </AdminButton>
            </div>
          </div>
        ) : null}

        {tab === "manual" && canCreateManually ? (
          <div className="admin-user-manage-body">
            <p className="admin-user-manage-hint">
              Benutzer wird sofort angelegt. 2FA ist verpflichtend — ohne abgeschlossene 2FA-Einrichtung kein Login.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminFormField label="Vorname" required>
                <input
                  className="admin-input"
                  value={manualForm.firstName}
                  onChange={(e) => setManualForm({ ...manualForm, firstName: e.target.value })}
                />
              </AdminFormField>
              <AdminFormField label="Nachname" required>
                <input
                  className="admin-input"
                  value={manualForm.lastName}
                  onChange={(e) => setManualForm({ ...manualForm, lastName: e.target.value })}
                />
              </AdminFormField>
              <AdminFormField label="E-Mail" required className="sm:col-span-2">
                <input
                  className="admin-input"
                  type="email"
                  value={manualForm.email}
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                />
              </AdminFormField>
              <AdminFormField label="Rolle" required>
                <select
                  className="admin-input"
                  value={manualForm.roleId}
                  onChange={(e) => setManualForm({ ...manualForm, roleId: e.target.value })}
                >
                  {allowedRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </AdminFormField>
              <AdminFormField label="Passwort" className="sm:col-span-2">
                <label className="admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={manualForm.useGeneratedPassword}
                    onChange={(e) => setManualForm({ ...manualForm, useGeneratedPassword: e.target.checked })}
                  />
                  Temporäres Passwort automatisch generieren
                </label>
                {!manualForm.useGeneratedPassword ? (
                  <input
                    className="admin-input mt-3"
                    type="password"
                    value={manualForm.password}
                    onChange={(e) => setManualForm({ ...manualForm, password: e.target.value })}
                    placeholder="Eigenes Passwort vergeben"
                  />
                ) : null}
              </AdminFormField>
              <label className="admin-checkbox-row sm:col-span-2">
                <input
                  type="checkbox"
                  checked={manualForm.mustChangePassword}
                  onChange={(e) => setManualForm({ ...manualForm, mustChangePassword: e.target.checked })}
                />
                Benutzer muss Passwort beim ersten Login ändern
              </label>
              <label className="admin-checkbox-row sm:col-span-2">
                <input type="checkbox" checked={manualForm.require2fa} disabled readOnly />
                2FA verpflichtend (Standard)
              </label>
              <label className="admin-checkbox-row sm:col-span-2">
                <input
                  type="checkbox"
                  checked={manualForm.sendWelcomeEmail}
                  onChange={(e) => setManualForm({ ...manualForm, sendWelcomeEmail: e.target.checked })}
                />
                Begrüßungs-E-Mail senden
              </label>
            </div>
            <div className="admin-user-manage-actions">
              <AdminButton variant="primary" icon={<Sparkles className="h-4 w-4" />} onClick={() => void createManual()}>
                Benutzer erstellen
              </AdminButton>
              <AdminButton variant="secondary" onClick={onClose}>
                {ADMIN_BTN.cancel}
              </AdminButton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
