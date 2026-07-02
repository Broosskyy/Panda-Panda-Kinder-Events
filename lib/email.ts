import { Resend } from "resend";

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY ist nicht gesetzt.");
  return new Resend(apiKey);
}

export function getNotificationEmail(): string {
  return process.env.INQUIRY_NOTIFICATION_EMAIL ?? "manuel.bauch0705@gmail.com";
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
}

interface InquiryEmailData {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  date: string;
  time: string;
  duration?: string;
  location: string;
  childrenCount: string;
  message?: string;
}

export async function sendInquiryNotification(data: InquiryEmailData) {
  const resend = getResendClient();
  const to = getNotificationEmail();

  const lines = [
    `Name: ${data.name}`,
    `Telefon: ${data.phone}`,
    `E-Mail: ${data.email}`,
    `Veranstaltung: ${data.eventType}`,
    `Datum: ${data.date}`,
    `Uhrzeit: ${data.time}`,
    data.duration ? `Dauer: ${data.duration}` : null,
    `Ort: ${data.location}`,
    `Anzahl Kinder: ${data.childrenCount}`,
    data.message ? `Nachricht: ${data.message}` : null,
  ].filter(Boolean);

  await resend.emails.send({
    from: getFromEmail(),
    to,
    subject: `Neue Anfrage — ${data.eventType} (${data.name})`,
    text: `Neue Buchungsanfrage über die Website:\n\n${lines.join("\n")}`,
  });
}
