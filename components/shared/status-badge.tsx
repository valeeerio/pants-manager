"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STATUS_META } from "@/components/lavori/lavoro-shared";

const STATUS_OPTIONS = Object.keys(STATUS_META);

interface StatusBadgeProps {
  status: string;
  /** Se presente, il badge diventa interattivo: click apre un menu con conferma esplicita per opzione. */
  onChange?: (newStatus: string) => Promise<void> | void;
  disabled?: boolean;
}

export function StatusBadge({ status, onChange, disabled }: StatusBadgeProps) {
  const variant = STATUS_META[status]?.variant ?? "muted";
  const isInteractive = typeof onChange === "function";

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onDocClick(e: MouseEvent) {
      if (
        menuRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  if (!isInteractive) {
    return <Badge variant={variant}>{status}</Badge>;
  }

  function openMenu() {
    if (disabled || isSaving) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPosition({ top: rect.bottom + 6, left: rect.left });
    setError("");
    setIsOpen(true);
  }

  async function handleSelect(newStatus: string) {
    if (newStatus === status) {
      setIsOpen(false);
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onChange!(newStatus);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nell'aggiornamento dello stato");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        title="Cambia stato"
        disabled={disabled || isSaving}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        className="inline-flex items-center rounded-full transition-opacity hover:opacity-80 disabled:opacity-60"
      >
        <Badge variant={variant}>{isSaving ? "Aggiornamento..." : status}</Badge>
      </button>
      {isOpen && position &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[220] w-48 rounded-lg border border-stone-200 bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.18)]"
            style={{ top: position.top, left: position.left }}
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13px] transition-colors hover:bg-amber-50 ${
                  option === status ? "font-semibold text-slate-900" : "text-slate-600"
                }`}
              >
                {option}
                {option === status && <Check className="h-3.5 w-3.5 text-amber-600" />}
              </button>
            ))}
            {error && <p className="px-3 py-1.5 text-[12px] text-red-600">{error}</p>}
          </div>,
          document.body
        )}
    </>
  );
}
