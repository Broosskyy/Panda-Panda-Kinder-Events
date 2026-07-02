"use client";

import { useState, type FormEvent } from "react";
import { Check, Send } from "lucide-react";
import Link from "next/link";
import { eventTypes } from "@/lib/faqs";
import { inquirySchema, type InquiryFormData } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const inputClass =
  "w-full rounded-xl border border-border bg-bg-card px-4 py-4 text-base text-text-primary placeholder:text-text-muted transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 min-h-[52px]";

const labelClass = "mb-2.5 block text-sm font-medium text-text-primary";

export function InquiryForm() {
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryFormData, string>>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSubmitError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      eventType: formData.get("eventType") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      duration: (formData.get("duration") as string) || "",
      location: formData.get("location") as string,
      childrenCount: formData.get("childrenCount") as string,
      message: (formData.get("message") as string) || "",
      privacy: formData.get("privacy") === "on",
    };

    const result = inquirySchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof InquiryFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof InquiryFormData;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setSubmitError(responseData.error ?? "Anfrage konnte nicht gesendet werden.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      e.currentTarget.reset();
    } catch {
      setSubmitError("Netzwerkfehler. Bitte prüft eure Verbindung und versucht es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card padding="lg" hover={false} className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-text-inverse shadow-md">
          <Check className="h-8 w-8" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-text-primary">
          Vielen Dank für eure Anfrage!
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-text-secondary">
          Wir haben eure Nachricht erhalten und melden uns in Kürze bei euch. Bis bald — eure
          Panda-Bande!
        </p>
        <Button className="mt-8 w-full sm:w-auto" size="lg" onClick={() => setIsSuccess(false)}>
          Neue Anfrage senden
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {submitError && (
        <div className="rounded-xl border border-accent-heart/30 bg-accent-heart/5 p-4 text-sm text-accent-heart">
          {submitError}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name *
          </label>
          <input id="name" name="name" type="text" required className={inputClass} placeholder="Euer Name" />
          {errors.name && <p className="mt-1.5 text-sm text-accent-heart">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Telefon *
          </label>
          <input id="phone" name="phone" type="tel" required className={inputClass} placeholder="+49 ..." />
          {errors.phone && <p className="mt-1.5 text-sm text-accent-heart">{errors.phone}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>
          E-Mail *
        </label>
        <input id="email" name="email" type="email" required className={inputClass} placeholder="eure@email.de" />
        {errors.email && <p className="mt-1.5 text-sm text-accent-heart">{errors.email}</p>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="eventType" className={labelClass}>
            Art der Veranstaltung *
          </label>
          <select id="eventType" name="eventType" required className={inputClass}>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.eventType && <p className="mt-1.5 text-sm text-accent-heart">{errors.eventType}</p>}
        </div>
        <div>
          <label htmlFor="childrenCount" className={labelClass}>
            Anzahl der Kinder *
          </label>
          <input
            id="childrenCount"
            name="childrenCount"
            type="number"
            min="1"
            required
            className={inputClass}
            placeholder="z. B. 12"
          />
          {errors.childrenCount && (
            <p className="mt-1.5 text-sm text-accent-heart">{errors.childrenCount}</p>
          )}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={labelClass}>
            Datum *
          </label>
          <input id="date" name="date" type="date" required className={inputClass} />
          {errors.date && <p className="mt-1.5 text-sm text-accent-heart">{errors.date}</p>}
        </div>
        <div>
          <label htmlFor="time" className={labelClass}>
            Uhrzeit *
          </label>
          <input id="time" name="time" type="time" required className={inputClass} />
          {errors.time && <p className="mt-1.5 text-sm text-accent-heart">{errors.time}</p>}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="duration" className={labelClass}>
            Dauer
          </label>
          <input id="duration" name="duration" type="text" className={inputClass} placeholder="z. B. 4 Stunden" />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>
            Ort / Location *
          </label>
          <input id="location" name="location" type="text" required className={inputClass} placeholder="Adresse" />
          {errors.location && <p className="mt-1.5 text-sm text-accent-heart">{errors.location}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="message" className={labelClass}>
          Nachricht
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={inputClass}
          placeholder="Besonderheiten, Wünsche, Allergien..."
        />
      </div>
      <div className="flex items-start gap-3">
        <input
          id="privacy"
          name="privacy"
          type="checkbox"
          defaultChecked
          className="mt-1.5 h-5 w-5 accent-primary"
        />
        <label htmlFor="privacy" className="text-sm leading-relaxed text-text-secondary">
          Ich stimme der{" "}
          <Link href="/datenschutz" className="text-primary underline hover:no-underline">
            Datenschutzerklärung
          </Link>{" "}
          zu und bin einverstanden, dass meine Daten zur Bearbeitung der Anfrage gespeichert werden. *
        </label>
      </div>
      {errors.privacy && <p className="text-sm text-accent-heart">{errors.privacy}</p>}
      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="w-full"
        icon={<Send className="h-4 w-4" />}
      >
        {isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
      </Button>
    </form>
  );
}
