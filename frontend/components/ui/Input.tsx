import type { InputHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export function Input({
  label,
  id,
  error,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label htmlFor={id} className="block text-left">
      <span className="mb-1 block text-sm font-semibold text-brand-900">{label}</span>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:ring-2 ${
          error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-brand-500 focus:ring-brand-200"
        } ${className}`}
        {...props}
      />
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </label>
  );
}

export function Select({
  label,
  id,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="block text-left">
      <span className="mb-1 block text-sm font-semibold text-brand-900">{label}</span>
      <div className="relative">
        {/* `appearance-none` tira o estilo nativo do <select> (que renderiza
            com uma altura diferente de um <input> mesmo com o mesmo padding)
            — o ícone abaixo substitui a seta nativa removida. */}
        <select
          id={id}
          className={`w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-base text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-200 ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}
