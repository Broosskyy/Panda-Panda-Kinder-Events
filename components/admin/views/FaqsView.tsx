"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Plus } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState } from "@/components/admin/ui";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM } from "@/lib/admin/messages";

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  visible: boolean;
}

export function FaqsView() {
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const { confirm, runAction } = useAdminActionFeedback();
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen.");
    await load();
    return data;
  };

  const runSave = (body: Record<string, unknown>, method: "POST" | "PATCH" | "DELETE", success = ACTION_RESULTS.faqSaved()) =>
    runAction({
      action: () => save(body, method),
      success,
      error: (error) => ACTION_RESULTS.genericError(error instanceof Error ? error.message : undefined),
    });

  const remove = async (id: string) => {
    const ok = await confirm({
      title: "FAQ löschen",
      message: ADMIN_CONFIRM.deleteFaq,
      confirmLabel: "Löschen",
      destructive: true,
    });
    if (!ok) return;
    await runSave({ id }, "DELETE", ACTION_RESULTS.faqDeleted());
  };

  return (
    <div>
      <AdminPageHeader {...page}>
        <AdminButton
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() =>
            void runSave(
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
              void runSave(
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
              onBlur={(e) => {
                if (e.target.value !== f.question) {
                  void runSave({ id: f.id, question: e.target.value }, "PATCH");
                }
              }}
            />
            <textarea
              defaultValue={f.answer}
              rows={3}
              className="admin-input min-h-24"
              onBlur={(e) => {
                if (e.target.value !== f.answer) {
                  void runSave({ id: f.id, answer: e.target.value }, "PATCH");
                }
              }}
            />
            <div className="mt-3 flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.visible}
                  onChange={(e) => void runSave({ id: f.id, visible: e.target.checked }, "PATCH")}
                />
                Sichtbar
              </label>
              <button
                type="button"
                onClick={() => void remove(f.id)}
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
