"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Plus } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState } from "@/components/admin/ui";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM, confirmDanger } from "@/lib/admin/messages";

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  visible: boolean;
}

export function FaqsView() {
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const { saved, saveFailed } = useAdminMessages();
  const page = adminPageHeaderProps("faq");
  const empty = ADMIN_EMPTY_STATES.faqs;

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
      saved();
      load();
    } else saveFailed();
  };

  return (
    <div>
      <AdminPageHeader {...page}>
        <AdminButton
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() =>
            save(
              { question: "Neue Frage?", answer: "Antwort...", sort_order: faqs.length, visible: true },
              "POST",
            )
          }
        >
          Neue FAQ
        </AdminButton>
      </AdminPageHeader>
      <div className="space-y-4">
        {faqs.length === 0 ? (
          <AdminEmptyState
            icon={HelpCircle}
            title={empty.title}
            description={empty.description}
            actionLabel={empty.actionLabel}
            onAction={() =>
              save(
                { question: "Neue Frage?", answer: "Antwort...", sort_order: 0, visible: true },
                "POST",
              )
            }
          />
        ) : null}
        {faqs.map((f) => (
          <AdminCard key={f.id}>
            <input
              defaultValue={f.question}
              className="admin-input mb-3 font-medium"
              onBlur={(e) =>
                e.target.value !== f.question && save({ id: f.id, question: e.target.value }, "PATCH")
              }
            />
            <textarea
              defaultValue={f.answer}
              rows={3}
              className="admin-input min-h-24"
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
                onClick={() => confirmDanger(ADMIN_CONFIRM.deleteFaq) && save({ id: f.id }, "DELETE")}
                className="admin-btn-danger text-xs"
              >
                {ADMIN_BTN.delete}
              </button>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
