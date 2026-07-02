"use client";

import { useState, type FormEvent } from "react";
import { Check, Star } from "lucide-react";
import { eventTypes } from "@/lib/faqs";
import { focusRing, inputClassName, labelClassName } from "@/lib/a11y";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
        <div
          role="status"
          aria-live="polite"
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-text-inverse shadow-md"
        >
          <Check className="h-8 w-8" aria-hidden />
        </div>
        <p className="text-lg font-medium text-text-primary">{success}</p>
        <Button className="mt-6 w-full sm:w-auto" variant="secondary" onClick={() => setSuccess("")}>
          Weitere Bewertung abgeben
        </Button>
      </Card>
    );
  }

  return (
    <Card padding="lg" hover={false}>
      <h3 className="font-heading text-xl font-bold text-text-primary md:text-2xl">
        Bewertung abgeben
      </h3>
      <p className="mt-2 text-base text-text-muted">
        Eure Bewertung wird nach Prüfung veröffentlicht.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate aria-label="Bewertungsformular">
        <div>
          <label htmlFor="review-name" className={labelClassName}>
            Name <span className="text-accent-heart" aria-hidden>*</span>
            <span className="sr-only">(Pflichtfeld)</span>
          </label>
          <input
            id="review-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-required="true"
            className={inputClassName}
            placeholder="Euer Name"
          />
        </div>
        <div>
          <label htmlFor="review-event" className={labelClassName}>
            Event-Art <span className="text-accent-heart" aria-hidden>*</span>
            <span className="sr-only">(Pflichtfeld)</span>
          </label>
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
        </div>
        <fieldset>
          <legend className={labelClassName}>
            Sterne <span className="text-accent-heart" aria-hidden>*</span>
            <span className="sr-only">(Pflichtfeld)</span>
          </legend>
          <div className="flex gap-1" role="radiogroup" aria-label="Sternebewertung">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors hover:bg-bg-secondary ${focusRing}`}
                aria-label={`${star} von 5 Sternen`}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
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
        <div>
          <label htmlFor="review-text" className={labelClassName}>
            Bewertungstext <span className="text-accent-heart" aria-hidden>*</span>
            <span className="sr-only">(Pflichtfeld)</span>
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            aria-required="true"
            minLength={10}
            rows={4}
            className={inputClassName}
            placeholder="Erzählt uns von eurer Erfahrung..."
          />
        </div>
        {error && (
          <p role="alert" aria-live="assertive" className="text-base font-medium text-accent-heart">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} size="lg" className="w-full" aria-busy={loading}>
          {loading ? "Wird gesendet..." : "Bewertung absenden"}
        </Button>
      </form>
    </Card>
  );
}
