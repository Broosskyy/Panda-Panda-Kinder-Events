"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { eventTypes } from "@/lib/faqs";
import { focusRing, inputClassName, labelClassName, textareaClassName } from "@/lib/a11y";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { PandaMascot } from "@/components/ui/PandaMascot";

export function ReviewForm() {
  const [formLoadedAt] = useState(() => Date.now());
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState<string>(eventTypes[0]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [eventPreview, setEventPreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [eventFile, setEventFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageChange = (file: File | null, type: "profile" | "event") => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "profile") {
      setProfileFile(file);
      setProfilePreview(url);
    } else {
      setEventFile(file);
      setEventPreview(url);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (rating < 1) {
      setError("Bitte wähle eine Sternebewertung.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("eventType", eventType);
      fd.append("rating", String(rating));
      fd.append("text", text);
      fd.append("website", "");
      fd.append("_formLoadedAt", String(formLoadedAt));
      if (profileFile) fd.append("profileImage", profileFile);
      if (eventFile) fd.append("eventImage", eventFile);

      const res = await fetch("/api/reviews", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Bewertung konnte nicht gesendet werden.");
        return;
      }

      setSuccess(data.message);
      setName("");
      setEventType(eventTypes[0]);
      setRating(0);
      setText("");
      setProfileFile(null);
      setEventFile(null);
      setProfilePreview(null);
      setEventPreview(null);
    } catch {
      setError("Netzwerkfehler. Bitte später erneut versuchen.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card padding="lg" hover={false} className="text-center">
        <PandaMascot size={90} className="mx-auto mb-6" />
        <div role="status" aria-live="polite">
          <p className="text-xl font-medium text-text-primary">{success}</p>
        </div>
        <Button className="mt-8 w-full sm:w-auto" variant="secondary" size="lg" onClick={() => setSuccess("")}>
          Weitere Bewertung abgeben
        </Button>
      </Card>
    );
  }

  return (
    <Card padding="lg" hover={false}>
      <h3 className="font-heading text-2xl font-bold text-text-primary">Bewertung abgeben</h3>
      <p className="mt-3 text-base text-text-muted">Eure Bewertung wird nach Prüfung veröffentlicht.</p>

      <form onSubmit={handleSubmit} className="relative mt-8 space-y-6" noValidate aria-label="Bewertungsformular">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />
        <input type="hidden" name="_formLoadedAt" value={formLoadedAt} />
        <FormField id="review-name" label="Name" required>
          <input
            id="review-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-required="true"
            placeholder=" "
            className={inputClassName}
          />
        </FormField>

        <FormField id="review-event" label="Event-Art" required>
          <select
            id="review-event"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            required
            aria-required="true"
            className={inputClassName}
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>

        <fieldset>
          <legend className={labelClassName}>
            Sterne <span className="text-accent-heart" aria-hidden>*</span>
            <span className="sr-only"> (Pflichtfeld)</span>
          </legend>
          <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Sternebewertung">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all hover:bg-bg-secondary hover:scale-105 ${focusRing}`}
                aria-label={`${star} von 5 Sternen`}
              >
                <Star
                  className={`h-9 w-9 transition-colors ${
                    star <= (hoverRating || rating) ? "fill-accent-gold text-accent-gold" : "text-text-muted/50"
                  }`}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </fieldset>

        <FormField id="review-text" label="Bewertungstext" required>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            aria-required="true"
            minLength={10}
            rows={4}
            placeholder=" "
            className={textareaClassName}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="review-profile" label="Profilbild (optional)">
            <input
              id="review-profile"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={inputClassName}
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null, "profile")}
            />
            {profilePreview ? (
              <div className="relative mt-3 h-16 w-16 overflow-hidden rounded-full">
                <Image src={profilePreview} alt="Profilbild Vorschau" fill className="object-cover" />
              </div>
            ) : null}
          </FormField>

          <FormField id="review-event-photo" label="Eventfoto (optional)">
            <input
              id="review-event-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={inputClassName}
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null, "event")}
            />
            {eventPreview ? (
              <div className="relative mt-3 h-20 w-full overflow-hidden rounded-xl">
                <Image src={eventPreview} alt="Eventfoto Vorschau" fill className="object-cover" />
              </div>
            ) : null}
          </FormField>
        </div>

        {error && (
          <p role="alert" aria-live="assertive" className="text-base font-medium text-accent-heart">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} size="lg" className="w-full shadow-lg" aria-busy={loading}>
          {loading ? "Wird gesendet..." : "Bewertung absenden"}
        </Button>
      </form>
    </Card>
  );
}
