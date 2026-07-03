"use client";

import { useState, type FormEvent } from "react";
import { Star } from "lucide-react";
import { eventTypes } from "@/lib/faqs";
import { focusRing, inputClassName, labelClassName, textareaClassName } from "@/lib/a11y";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { PandaMascot } from "@/components/ui/PandaMascot";

export function ReviewForm() {
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState<string>(eventTypes[0]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, eventType, rating, text }),
      });

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
      <p className="mt-3 text-base text-text-muted">
        Eure Bewertung wird nach Prüfung veröffentlicht.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate aria-label="Bewertungsformular">
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
                    star <= (hoverRating || rating)
                      ? "fill-accent-gold text-accent-gold"
                      : "text-text-muted/50"
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
