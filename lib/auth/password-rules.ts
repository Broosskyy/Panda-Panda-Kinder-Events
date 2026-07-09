import type { PasswordPolicy } from "@/lib/auth/types";

export const DEFAULT_INVITE_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireNumber: true,
};

export function validatePasswordRules(password: string, policy: PasswordPolicy): string | null {
  if (password.length < policy.minLength) {
    return `Passwort muss mindestens ${policy.minLength} Zeichen haben.`;
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    return "Passwort muss mindestens einen Großbuchstaben enthalten.";
  }
  if (policy.requireNumber && !/\d/.test(password)) {
    return "Passwort muss mindestens eine Zahl enthalten.";
  }
  return null;
}

export interface PasswordRuleStatus {
  id: string;
  label: string;
  ok: boolean;
}

export function getPasswordRuleStatuses(password: string, policy: PasswordPolicy): PasswordRuleStatus[] {
  return [
    {
      id: "length",
      label: `Mindestens ${policy.minLength} Zeichen`,
      ok: password.length >= policy.minLength,
    },
    {
      id: "uppercase",
      label: "Mindestens ein Großbuchstabe",
      ok: !policy.requireUppercase || /[A-Z]/.test(password),
    },
    {
      id: "number",
      label: "Mindestens eine Zahl",
      ok: !policy.requireNumber || /\d/.test(password),
    },
    {
      id: "match",
      label: "Passwörter stimmen überein",
      ok: false,
    },
  ];
}

export function getPasswordRuleStatusesWithConfirm(
  password: string,
  confirm: string,
  policy: PasswordPolicy,
): PasswordRuleStatus[] {
  const rules = getPasswordRuleStatuses(password, policy).filter((r) => r.id !== "match");
  rules.push({
    id: "match",
    label: "Passwörter stimmen überein",
    ok: password.length > 0 && password === confirm,
  });
  return rules;
}

export function isPasswordValid(password: string, confirm: string, policy: PasswordPolicy): boolean {
  if (password !== confirm) return false;
  return validatePasswordRules(password, policy) === null;
}
