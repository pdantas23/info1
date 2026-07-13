import type { ReactNode } from "react";
import { Container } from "./Container";

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-14 sm:py-20 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  description,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow ? (
        <span
          className={`inline-block rounded-full border bg-transparent px-4 py-1 text-sm font-semibold ${
            isDark ? "border-white/30 text-white" : "border-brand-300 text-brand-700"
          }`}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2 className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-brand-900"}`}>
        {title}
      </h2>
      {subtitle ? (
        <p className={`mt-2 text-lg font-medium ${isDark ? "text-brand-200" : "text-brand-600"}`}>{subtitle}</p>
      ) : null}
      {description ? (
        <p className={`mt-4 text-base ${isDark ? "text-brand-100" : "text-slate-600"}`}>{description}</p>
      ) : null}
    </div>
  );
}
