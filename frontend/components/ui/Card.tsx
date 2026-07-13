import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  hoverable = true,
  padding = "p-6",
}: {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-brand-100/70 bg-white ${padding} shadow-[0_1px_2px_rgba(15,46,42,0.05)] transition-all duration-200 ${hoverable ? "hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_20px_40px_-16px_rgba(15,46,42,0.2)]" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
