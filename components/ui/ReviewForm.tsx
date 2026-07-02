"use client";

import { useState, type FormEvent } from "react";
import { Star } from "lucide-react";
import { eventTypes } from "@/lib/faqs";

const inputClass =
  "w-full rounded-lg border border-border bg-bg-card px-4 py-3.5 text-base text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

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
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
        <p className="font-medium text-text-primary">{success}</p>
        <button
          type="button"
          onClick={() => setSuccess("")}
          className="mt-4 text-sm text-primary underline"
        >
          Weitere Bewertung abgeben
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-bg-card p-6">
      <h3 className="font-heading text-lg font-bold text-text-primary">Bewertung abgeben</h3>
      <div>
        <label htmlFor="review-name" className="mb-2 block text-sm font-medium">
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
        <label htmlFor="review-event" className="mb-2 block text-sm font-medium">
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
        <p className="mb-2 text-sm font-medium">Sterne *</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
              aria-label={`${star} Sterne`}
            >
              <Star
                className={`h-7 w-7 ${
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
        <label htmlFor="review-text" className="mb-2 block text-sm font-medium">
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
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-primary py-3.5 text-sm font-medium text-white disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {loading ? "Wird gesendet..." : "Bewertung absenden"}
      </button>
    </form>
  );
}
