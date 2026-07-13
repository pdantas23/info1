"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/format";
import { trackEvent } from "@/lib/meta/pixel";

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SuccessExperience({
  productName,
  amountCents,
  currency,
}: {
  productName: string;
  amountCents: number | null;
  currency: string;
}) {
  // El pago ya fue confirmado por la Stripe (llegamos acá vía su success_url);
  // el estado real de la orden, sin embargo, solo cambia a "paid" a partir
  // del webhook — este evento es solo para tracking de conversión.
  useEffect(() => {
    trackEvent("Purchase", {
      customData: { content_name: productName, value: amountCents ? amountCents / 100 : undefined, currency },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-brand-50 py-10">
      <Container className="max-w-2xl">
        <Card className="mt-6 text-center" hoverable={false}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <CheckIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-brand-900">¡Pago exitoso!</h1>
          {amountCents !== null ? (
            <p className="mt-2 text-sm text-slate-600">Total pagado: {formatPrice(amountCents, currency)}</p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">Revisa tu correo: te enviamos el acceso a tu programa.</p>
          <Link href="/" className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-800">
            Volver al inicio
          </Link>
        </Card>
      </Container>
    </main>
  );
}
