"use client";

import { useState, type FormEvent } from "react";
import { Check, Star } from "lucide-react";
import { eventTypes } from "@/lib/faqs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const inputClass =
  "w-full rounded-xl border border-border bg-bg-card px-4 py-4 text-base text-text-primary placeholder:text-text-muted transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 min-h-[52px]";

const labelClass = "mb-2.5 block text-sm font-medium text-text-primary";

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
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-text-inverse shadow-md">
          <Check className="h-8 w-8" />
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
      <p className="mt-2 text-sm text-text-muted">
        Eure Bewertung wird nach Prüfung veröffentlicht.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="review-name" className={labelClass}>
            Name *
          </label>
          <input
            id="review-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
            placeholder="Euer Name"
          />
        </div>
        <div>
          <label htmlFor="review-event" className={labelClass}>
            Event-Art *
          </label>
          <select
            id="review-event"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            required
            className={inputClass}
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className={labelClass}>Sterne *</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="flex h-12 w-12 items-center justify-center rounded-xl transition-colors hover:bg-bg-secondary"
                aria-label={`${star} Sterne`}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-accent-gold text-accent-gold"
                      : "text-border"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="review-text" className={labelClass}>
            Bewertungstext *
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            minLength={10}
            rows={4}
            className={inputClass}
            placeholder="Erzählt uns von eurer Erfahrung..."
          />
        </div>
        {error && <p className="text-sm text-accent-heart">{error}</p>}
        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? "Wird gesendet..." : "Bewertung absenden"}
        </Button>
      </form>
    </Card>
  );
}
