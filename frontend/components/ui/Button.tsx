import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "outline";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40",
  secondary: "bg-brand-600 text-white hover:bg-brand-700",
  outline: "border-2 border-brand-600 text-brand-700 hover:bg-brand-50",
};

const sizeClasses: Record<Size, string> = {
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const base =
  "relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-bold transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100";

function ShineOverlay() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 animate-shine bg-gradient-to-r from-transparent via-white/50 to-transparent"
    />
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {variant === "primary" ? <ShineOverlay /> : null}
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {variant === "primary" ? <ShineOverlay /> : null}
      {children}
    </Link>
  );
}
