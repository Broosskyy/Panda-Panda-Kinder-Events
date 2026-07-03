"use client";

import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { useAdminUi } from "@/components/admin/AdminUiProvider";

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  visible: boolean;
}

export function FaqsView() {
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const { toast } = useAdminUi();

  const load = () =>
    fetch("/api/admin/faqs")
      .then((r) => r.json())
      .then((d) => setFaqs(d.faqs ?? []));

  useEffect(() => {
    load();
  }, []);

  const save = async (body: Record<string, unknown>, method: "POST" | "PATCH" | "DELETE") => {
    const res = await fetch("/api/admin/faqs", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast("Gespeichert");
      load();
    } else toast("Fehler", "error");
  };

  return (
    <div>
      <AdminPageHeader title="FAQ" description="Häufige Fragen verwalten">
        <button
          type="button"
          onClick={() =>
            save(
              { question: "Neue Frage?", answer: "Antwort...", sort_order: faqs.length, visible: true },
              "POST",
            )
          }
          className="min-h-11 rounded-full bg-primary px-6 text-sm font-medium text-white"
        >
          + Neue FAQ
        </button>
      </AdminPageHeader>
      <div className="space-y-4">
        {faqs.map((f) => (
          <AdminCard key={f.id}>
            <input
              defaultValue={f.question}
              className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-sm font-medium"
              onBlur={(e) =>
                e.target.value !== f.question && save({ id: f.id, question: e.target.value }, "PATCH")
              }
            />
            <textarea
              defaultValue={f.answer}
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              onBlur={(e) =>
                e.target.value !== f.answer && save({ id: f.id, answer: e.target.value }, "PATCH")
              }
            />
            <div className="mt-3 flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.visible}
                  onChange={(e) => save({ id: f.id, visible: e.target.checked }, "PATCH")}
                />
                Sichtbar
              </label>
              <button
                type="button"
                onClick={() => confirm("Löschen?") && save({ id: f.id }, "DELETE")}
                className="text-xs text-accent-heart underline"
              >
                Löschen
              </button>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
