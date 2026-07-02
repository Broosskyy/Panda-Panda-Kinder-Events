import { z } from "zod";
import { eventTypes } from "@/lib/faqs";

export const inquirySchema = z.object({
  name: z.string().min(2, "Bitte gib deinen Namen ein."),
  phone: z.string().min(6, "Bitte gib eine gültige Telefonnummer ein."),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  eventType: z.enum(eventTypes, { errorMap: () => ({ message: "Bitte wähle eine Veranstaltungsart." }) }),
  date: z.string().min(1, "Bitte wähle ein Datum."),
  time: z.string().min(1, "Bitte wähle eine Uhrzeit."),
  duration: z.string().optional(),
  location: z.string().min(3, "Bitte gib den Veranstaltungsort an."),
  childrenCount: z
    .string()
    .min(1, "Bitte gib die Anzahl der Kinder an.")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Mindestens 1 Kind."),
  message: z.string().optional(),
  privacy: z.literal(true, { errorMap: () => ({ message: "Bitte stimme der Datenschutzerklärung zu." }) }),
});

export type InquiryFormData = z.infer<typeof inquirySchema>;

export const defaultInquiryValues: InquiryFormData = {
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
