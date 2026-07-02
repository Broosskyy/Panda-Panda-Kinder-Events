"use client";

import { useState, type FormEvent } from "react";
import { Check, Send } from "lucide-react";
import Link from "next/link";
import { eventTypes } from "@/lib/faqs";
import { inquirySchema, type InquiryFormData } from "@/lib/validation";
import { inputClassName, labelClassName } from "@/lib/a11y";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-accent-heart">
      {message}
    </p>
  );
}

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
        <div
          role="status"
          aria-live="polite"
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-text-inverse shadow-md"
        >
          <Check className="h-8 w-8" aria-hidden />
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
    <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-label="Anfrageformular">
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-accent-heart/40 bg-accent-heart/5 p-4 text-base font-medium text-accent-heart"
        >
          {submitError}
        </div>
      )}
      <p className="text-sm text-text-muted">
        Mit <span className="text-accent-heart">*</span> markierte Felder sind Pflichtfelder.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClassName}>
            Name <span className="text-accent-heart" aria-hidden>*</span>
            <span className="sr-only">(Pflichtfeld)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClassName}
            placeholder="Euer Name"
          />
          {errors.name && <FieldError id="name-error" message={errors.name} />}
        </div>
        <div>
          <label htmlFor="phone" className={labelClassName}>
            Telefon <span className="text-accent-heart" aria-hidden>*</span>
            <span className="sr-only">(Pflichtfeld)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={inputClassName}
            placeholder="+49 ..."
          />
          {errors.phone && <FieldError id="phone-error" message={errors.phone} />}
        </div>
      </div>
      <div>
        <label htmlFor="email" className={labelClassName}>
          E-Mail <span className="text-accent-heart" aria-hidden>*</span>
          <span className="sr-only">(Pflichtfeld)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={inputClassName}
          placeholder="eure@email.de"
        />
        {errors.email && <FieldError id="email-error" message={errors.email} />}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="eventType" className={labelClassName}>
            Art der Veranstaltung <span className="text-accent-heart" aria-hidden>*</span>
            <span className="sr-only">(Pflichtfeld)</span>
          </label>
          <select
            id="eventType"
            name="eventType"
            required
            aria-required="true"
            aria-invalid={!!errors.eventType}
            aria-describedby={errors.eventType ? "eventType-error" : undefined}
            className={inputClassName}
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.eventType && <FieldError id="eventType-error" message={errors.eventType} />}
        </div>
        <div>
          <label htmlFor="childrenCount" className={labelClassName}>
            Anzahl der Kinder <span className="text-accent-heart" aria-hidden>*</span>
            <span className="sr-only">(Pflichtfeld)</span>
          </label>
          <input
            id="childrenCount"
            name="childrenCount"
            type="number"
            min="1"
            required
            aria-required="true"
            aria-invalid={!!errors.childrenCount}
            aria-describedby={errors.childrenCount ? "childrenCount-error" : undefined}
            className={inputClassName}
            placeholder="z. B. 12"
          />
          {errors.childrenCount && (
            <FieldError id="childrenCount-error" message={errors.childrenCount} />
          )}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={labelClassName}>
            Datum <span className="text-accent-heart" aria-hidden>*</span>
            <span className="sr-only">(Pflichtfeld)</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            aria-required="true"
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "date-error" : undefined}
            className={inputClassName}
          />
          {errors.date && <FieldError id="date-error" message={errors.date} />}
        </div>
        <div>
          <label htmlFor="time" className={labelClassName}>
            Uhrzeit <span className="text-accent-heart" aria-hidden>*</span>
            <span className="sr-only">(Pflichtfeld)</span>
          </label>
          <input
            id="time"
            name="time"
            type="time"
            required
            aria-required="true"
            aria-invalid={!!errors.time}
            aria-describedby={errors.time ? "time-error" : undefined}
            className={inputClassName}
          />
          {errors.time && <FieldError id="time-error" message={errors.time} />}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="duration" className={labelClassName}>
            Dauer
          </label>
          <input
            id="duration"
            name="duration"
            type="text"
            className={inputClassName}
            placeholder="z. B. 4 Stunden"
          />
        </div>
        <div>
          <label htmlFor="location" className={labelClassName}>
            Ort / Location <span className="text-accent-heart" aria-hidden>*</span>
            <span className="sr-only">(Pflichtfeld)</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            aria-required="true"
            aria-invalid={!!errors.location}
            aria-describedby={errors.location ? "location-error" : undefined}
            className={inputClassName}
            placeholder="Adresse"
          />
          {errors.location && <FieldError id="location-error" message={errors.location} />}
        </div>
      </div>
      <div>
        <label htmlFor="message" className={labelClassName}>
          Nachricht
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={inputClassName}
          placeholder="Besonderheiten, Wünsche, Allergien..."
        />
      </div>
      <div className="flex items-start gap-3">
        <input
          id="privacy"
          name="privacy"
          type="checkbox"
          defaultChecked
          required
          aria-required="true"
          aria-invalid={!!errors.privacy}
          aria-describedby={errors.privacy ? "privacy-error" : undefined}
          className="mt-1.5 h-6 w-6 accent-primary"
        />
        <label htmlFor="privacy" className="text-base leading-relaxed text-text-secondary">
          Ich stimme der{" "}
          <Link href="/datenschutz" className="text-primary underline hover:no-underline">
            Datenschutzerklärung
          </Link>{" "}
          zu und bin einverstanden, dass meine Daten zur Bearbeitung der Anfrage gespeichert werden.{" "}
          <span className="text-accent-heart" aria-hidden>*</span>
          <span className="sr-only">(Pflichtfeld)</span>
        </label>
      </div>
      {errors.privacy && <FieldError id="privacy-error" message={errors.privacy} />}
      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="w-full"
        icon={<Send className="h-4 w-4" aria-hidden />}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
      </Button>
    </form>
  );
}
