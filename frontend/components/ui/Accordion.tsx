"use client";

import { useState } from "react";

export function Accordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-brand-100 overflow-hidden rounded-2xl border border-brand-100 bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-brand-900">{item.question}</span>
              <span
                className={`shrink-0 text-2xl leading-none text-brand-500 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              aria-hidden={!isOpen}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-5 text-slate-600">{item.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
