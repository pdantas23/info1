import type { ReactNode } from "react";

type Tone = "brand" | "accent" | "neutral";

const toneClasses: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-700",
  accent: "bg-accent-400/20 text-accent-600",
  neutral: "bg-slate-100 text-slate-600",
};

export function Badge({
  children,
  tone = "brand",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${toneClasses[tone]} ${className}`}>
      {children}
    </span>
  );
}
