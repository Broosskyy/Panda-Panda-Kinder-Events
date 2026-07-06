"use client";

import { useState, type FormEvent } from "react";
import { Check, Send } from "lucide-react";
import Link from "next/link";
import { eventTypes } from "@/lib/faqs";
import { inquirySimpleSchema, type InquirySimpleFormData } from "@/lib/validation";
import { inputClassName, textareaClassName } from "@/lib/a11y";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { PandaMascot } from "@/components/ui/PandaMascot";

const TRUST_POINTS = ["Kostenlos", "Unverbindlich", "Schnelle Rückmeldung"] as const;

interface InquiryFormProps {
  privacyHint?: string;
}

export function InquiryForm({ privacyHint }: InquiryFormProps) {
  const [formLoadedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<Partial<Record<keyof InquirySimpleFormData, string>>>({});
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
      message: formData.get("message") as string,
      childrenCount: (formData.get("childrenCount") as string) || "",
      privacy: formData.get("privacy") === "on",
      website: (formData.get("website") as string) || "",
      _formLoadedAt: Number(formData.get("_formLoadedAt")) || formLoadedAt,
    };

    const result = inquirySimpleSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof InquirySimpleFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof InquirySimpleFormData;
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

  const fieldProps = (key: keyof InquirySimpleFormData) => ({
    error: errors[key],
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  if (isSuccess) {
    return (
      <Card padding="lg" hover={false} className="text-center">
        <PandaMascot size={100} className="mx-auto mb-6" />
        <div role="status" aria-live="polite">
          <div className="form-success-icon mx-auto" aria-hidden>
            <Check className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <h3 className="font-heading mt-5 text-2xl font-bold text-text-primary md:text-3xl">
            Anfrage erfolgreich versendet
          </h3>
          <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-text-secondary">
            Wir melden uns innerhalb von 24 Stunden.
          </p>
        </div>
        <Button className="mt-10 w-full sm:w-auto" size="lg" onClick={() => setIsSuccess(false)}>
          Neue Anfrage senden
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-6" noValidate aria-label="Anfrageformular">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />
      <input type="hidden" name="_formLoadedAt" value={formLoadedAt} />

      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary" aria-label="Vorteile">
        {TRUST_POINTS.map((point) => (
          <li key={point} className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {point}
          </li>
        ))}
      </ul>

      {submitError ? (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-2xl border border-accent-heart/40 bg-accent-heart/5 p-5 text-base font-medium text-accent-heart"
        >
          {submitError}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="name" label="Name" required error={errors.name}>
          <input id="name" name="name" type="text" required className={inputClassName} placeholder=" " {...fieldProps("name")} />
        </FormField>
        <FormField id="phone" label="Telefon" required error={errors.phone}>
          <input id="phone" name="phone" type="tel" required className={inputClassName} placeholder=" " {...fieldProps("phone")} />
        </FormField>
      </div>

      <FormField id="email" label="E-Mail" required error={errors.email}>
        <input id="email" name="email" type="email" required className={inputClassName} placeholder=" " {...fieldProps("email")} />
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="date" label="Datum" required error={errors.date}>
          <input id="date" name="date" type="date" required className={inputClassName} {...fieldProps("date")} />
        </FormField>
        <FormField id="eventType" label="Art der Veranstaltung" required error={errors.eventType}>
          <select id="eventType" name="eventType" required className={inputClassName} {...fieldProps("eventType")}>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField id="childrenCount" label="Kinderanzahl (optional)" error={errors.childrenCount}>
        <input
          id="childrenCount"
          name="childrenCount"
          type="number"
          min={1}
          max={200}
          placeholder="z. B. 12"
          className={inputClassName}
          {...fieldProps("childrenCount")}
        />
      </FormField>

      <FormField id="message" label="Nachricht" required error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="Erzählt uns kurz von eurem Event…"
          className={textareaClassName}
          {...fieldProps("message")}
        />
      </FormField>

      <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-bg-secondary/40 p-5">
        <input
          id="privacy"
          name="privacy"
          type="checkbox"
          defaultChecked
          required
          className="mt-1 h-6 w-6 accent-primary"
          {...fieldProps("privacy")}
        />
        <label htmlFor="privacy" className="text-base leading-relaxed text-text-secondary">
          {privacyHint || (
            <>
              Ich stimme der{" "}
              <Link href="/datenschutz" className="text-primary underline hover:no-underline">
                Datenschutzerklärung
              </Link>{" "}
              zu. *
            </>
          )}
        </label>
      </div>
      {errors.privacy ? (
        <p id="privacy-error" role="alert" className="text-sm font-medium text-accent-heart">
          {errors.privacy}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="btn-premium w-full min-h-[3rem] shadow-xl"
        icon={<Send className="h-5 w-5" aria-hidden />}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? "Wird gesendet…" : "Jetzt unverbindlich anfragen"}
      </Button>
    </form>
  );
}
