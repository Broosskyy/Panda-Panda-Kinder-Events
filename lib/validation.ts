import { z } from "zod";
import { eventTypes } from "@/lib/faqs";

export const spamFieldsSchema = z.object({
  website: z.string().max(0).optional(),
  _formLoadedAt: z.number().optional(),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Bitte gib deinen Namen ein.").max(100),
  phone: z.string().trim().min(6, "Bitte gib eine gültige Telefonnummer ein.").max(30),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein.").max(120),
  eventType: z.enum(eventTypes, {
    errorMap: () => ({ message: "Bitte wähle eine Veranstaltungsart." }),
  }),
  date: z
    .string()
    .trim()
    .min(1, "Bitte wähle ein Datum.")
    .max(10)
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ungültiges Datum."),
  time: z.string().trim().min(1, "Bitte wähle eine Uhrzeit.").max(5),
  duration: z.string().trim().max(50).optional(),
  location: z.string().trim().min(3, "Bitte gib den Veranstaltungsort an.").max(200),
  childrenCount: z
    .string()
    .trim()
    .min(1, "Bitte gib die Anzahl der Kinder an.")
    .max(3)
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0 && Number(v) <= 200, "Ungültige Kinderanzahl."),
  message: z.string().trim().max(5000).optional(),
  privacy: z.literal(true, {
    errorMap: () => ({ message: "Bitte stimme der Datenschutzerklärung zu." }),
  }),
  website: z.string().max(0).optional(),
  _formLoadedAt: z.number().optional(),
});

export const inquirySimpleSchema = z.object({
  name: z.string().trim().min(2, "Bitte gib deinen Namen ein.").max(100),
  phone: z.string().trim().min(6, "Bitte gib eine gültige Telefonnummer ein.").max(30),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein.").max(120),
  eventType: z.enum(eventTypes, {
    errorMap: () => ({ message: "Bitte wähle eine Veranstaltungsart." }),
  }),
  date: z
    .string()
    .trim()
    .min(1, "Bitte wähle ein Datum.")
    .max(10)
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ungültiges Datum."),
  message: z.string().trim().min(3, "Bitte beschreibt kurz euer Anliegen.").max(5000),
  childrenCount: z.string().trim().max(3).optional(),
  privacy: z.literal(true, {
    errorMap: () => ({ message: "Bitte stimme der Datenschutzerklärung zu." }),
  }),
  website: z.string().max(0).optional(),
  _formLoadedAt: z.number().optional(),
});

export type InquirySimpleFormData = z.infer<typeof inquirySimpleSchema>;

export const inquiryApiSchema = inquirySimpleSchema;

export type InquiryFormData = z.infer<typeof inquirySchema>;

export const reviewSchema = z.object({
  name: z.string().trim().min(2, "Bitte gib deinen Namen ein.").max(100),
  eventType: z.enum(eventTypes),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(10, "Bitte schreibe mindestens 10 Zeichen.").max(2000),
  website: z.string().max(0).optional(),
  _formLoadedAt: z.number().optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

export const defaultInquiryValues: Omit<InquiryFormData, "website" | "_formLoadedAt"> = {
  name: "",
  phone: "",
  email: "",
  eventType: "Hochzeit",
  date: "",
  time: "",
  duration: "",
  location: "",
  childrenCount: "",
  message: "",
  privacy: true,
};

export function sanitizeHttpUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function sanitizePhone(value: string): string {
  return value.trim().slice(0, 30);
}

export function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
