"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import Link from "next/link";
import { eventTypes } from "@/lib/faqs";
import { inquirySchema, type InquiryFormData } from "@/lib/validation";
import { inputClassName, textareaClassName } from "@/lib/a11y";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { PandaMascot } from "@/components/ui/PandaMascot";

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

  const fieldProps = (key: keyof InquiryFormData) => ({
    error: errors[key],
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  if (isSuccess) {
    return (
      <Card padding="lg" hover={false} className="text-center">
        <PandaMascot size={100} className="mx-auto mb-6" />
        <div role="status" aria-live="polite">
          <h3 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
            Vielen Dank für eure Anfrage!
          </h3>
          <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-text-secondary">
            Wir haben eure Nachricht erhalten und melden uns in Kürze bei euch. Bis bald — eure
            Panda-Bande!
          </p>
        </div>
        <Button className="mt-10 w-full sm:w-auto" size="lg" onClick={() => setIsSuccess(false)}>
          Neue Anfrage senden
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-label="Anfrageformular">
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-2xl border border-accent-heart/40 bg-accent-heart/5 p-5 text-base font-medium text-accent-heart"
        >
          {submitError}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="name" label="Name" required error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            required
            aria-required="true"
            placeholder=" "
            className={inputClassName}
            {...fieldProps("name")}
          />
        </FormField>
        <FormField id="phone" label="Telefon" required error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            aria-required="true"
            placeholder=" "
            className={inputClassName}
            {...fieldProps("phone")}
          />
        </FormField>
      </div>

      <FormField id="email" label="E-Mail" required error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-required="true"
          placeholder=" "
          className={inputClassName}
          {...fieldProps("email")}
        />
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="eventType" label="Art der Veranstaltung" required error={errors.eventType}>
          <select
            id="eventType"
            name="eventType"
            required
            aria-required="true"
            className={inputClassName}
            {...fieldProps("eventType")}
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="childrenCount" label="Anzahl der Kinder" required error={errors.childrenCount}>
          <input
            id="childrenCount"
            name="childrenCount"
            type="number"
            min="1"
            required
            aria-required="true"
            placeholder=" "
            className={inputClassName}
            {...fieldProps("childrenCount")}
          />
        </FormField>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="date" label="Datum" required error={errors.date}>
          <input
            id="date"
            name="date"
            type="date"
            required
            aria-required="true"
            className={inputClassName}
            {...fieldProps("date")}
          />
        </FormField>
        <FormField id="time" label="Uhrzeit" required error={errors.time}>
          <input
            id="time"
            name="time"
            type="time"
            required
            aria-required="true"
            className={inputClassName}
            {...fieldProps("time")}
          />
        </FormField>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="duration" label="Dauer">
          <input
            id="duration"
            name="duration"
            type="text"
            placeholder=" "
            className={inputClassName}
          />
        </FormField>
        <FormField id="location" label="Ort / Location" required error={errors.location}>
          <input
            id="location"
            name="location"
            type="text"
            required
            aria-required="true"
            placeholder=" "
            className={inputClassName}
            {...fieldProps("location")}
          />
        </FormField>
      </div>

      <FormField id="message" label="Nachricht">
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder=" "
          className={textareaClassName}
        />
      </FormField>

      <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-bg-secondary/40 p-5">
        <input
          id="privacy"
          name="privacy"
          type="checkbox"
          defaultChecked
          required
          aria-required="true"
          aria-invalid={!!errors.privacy}
          aria-describedby={errors.privacy ? "privacy-error" : undefined}
          className="mt-1 h-6 w-6 accent-primary"
        />
        <label htmlFor="privacy" className="text-base leading-relaxed text-text-secondary">
          Ich stimme der{" "}
          <Link href="/datenschutz" className="text-primary underline hover:no-underline">
            Datenschutzerklärung
          </Link>{" "}
          zu und bin einverstanden, dass meine Daten zur Bearbeitung der Anfrage gespeichert werden. *
        </label>
      </div>
      {errors.privacy && (
        <p id="privacy-error" role="alert" className="text-sm font-medium text-accent-heart">
          {errors.privacy}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="w-full shadow-xl"
        icon={<Send className="h-5 w-5" aria-hidden />}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
      </Button>
    </form>
  );
}
