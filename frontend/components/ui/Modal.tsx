"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  onClose,
  closeLabel = "Fechar",
  maxWidthClassName = "max-w-lg",
  children,
}: {
  title: ReactNode;
  onClose: () => void;
  closeLabel?: string;
  maxWidthClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={`flex max-h-[90vh] w-full ${maxWidthClassName} flex-col rounded-2xl bg-white shadow-xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-50 p-6 pb-4">
          <h3 className="text-lg font-bold text-brand-900">{title}</h3>
          <button type="button" onClick={onClose} aria-label={closeLabel} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 pt-4">{children}</div>
      </div>
    </div>
  );
}
