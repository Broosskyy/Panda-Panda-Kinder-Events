import bcrypt from "bcryptjs";
import type { PasswordPolicy } from "@/lib/auth/types";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePassword(password: string, policy: PasswordPolicy): string | null {
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
