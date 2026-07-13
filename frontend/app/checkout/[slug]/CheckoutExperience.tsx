"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { trackEvent } from "@/lib/meta/pixel";
import { env } from "@/lib/env";
import type { Product } from "@/types";

type Step = "presentation" | "form" | "pay" | "success";

const stripePromise = env.stripe.publishableKey ? loadStripe(env.stripe.publishableKey) : null;

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#0f172a",
      "::placeholder": { color: "#94a3b8" },
    },
    invalid: { color: "#dc2626" },
  },
};

// Formatea el teléfono como +xx (xx) xxxx-xxxxxx a medida que el usuario escribe.
function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  let formatted = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 0) formatted += "+";
    if (i === 2) formatted += " (";
    if (i === 4) formatted += ") ";
    if (i === 8) formatted += "-";
    formatted += digits[i];
  }
  return formatted;
}

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

function Stepper({ labels, current }: { labels: string[]; current: number }) {
  return (
    <div className="flex items-start justify-center">
      {labels.map((label, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < current;
        const isActive = stepNumber === current;
        return (
          <div key={`${label}-${index}`} className="flex items-start">
            <div className="flex w-24 shrink-0 flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isDone ? "bg-brand-600 text-white" : isActive ? "bg-brand-900 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {isDone ? <CheckIcon className="h-4 w-4" /> : stepNumber}
              </div>
              <span className={`hidden text-center text-xs font-medium sm:block ${isActive ? "text-brand-900" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {index < labels.length - 1 ? (
              <div className={`mx-1 mt-4 h-0.5 w-8 shrink-0 sm:w-16 ${isDone ? "bg-brand-600" : "bg-slate-200"}`} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ProductOffer({
  offerProduct,
  currency,
  onAccept,
  onDecline,
}: {
  offerProduct: Product;
  currency: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row">
        {offerProduct.image_path ? (
          <div className="w-full sm:w-56 sm:shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={offerProduct.image_path} alt={offerProduct.name} className="h-48 w-full rounded-xl object-cover sm:h-full" />
          </div>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-brand-900">{offerProduct.name}</h2>
          {offerProduct.description ? <p className="mt-2 text-sm text-slate-600">{offerProduct.description}</p> : null}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-extrabold text-brand-900">{formatPrice(offerProduct.price_cents, currency)}</span>
            {offerProduct.compare_at_price_cents ? (
              <span className="text-base text-red-600 line-through">
                {formatPrice(offerProduct.compare_at_price_cents, currency)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <Button size="lg" className="mt-6 w-full" onClick={onAccept}>
        Sí, ¡lo quiero!
      </Button>
      <button
        type="button"
        className="mt-3 w-full text-center text-sm font-medium text-slate-400 hover:text-slate-600"
        onClick={onDecline}
      >
        No, gracias, continuar sin esto
      </button>
    </>
  );
}

function OrderLineItem({
  name,
  description,
  imagePath,
  priceCents,
  currency,
}: {
  name: string;
  description: string | null;
  imagePath: string | null;
  priceCents: number;
  currency: string;
}) {
  return (
    <div className="flex items-center gap-4">
      {imagePath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imagePath} alt={name} className="h-24 w-24 shrink-0 rounded-lg object-cover" />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold text-brand-900">{name}</p>
        {description ? <p className="truncate text-base text-slate-500">{description}</p> : null}
      </div>
      <span className="shrink-0 text-lg font-semibold text-brand-900">{formatPrice(priceCents, currency)}</span>
    </div>
  );
}

function PayStep({
  product,
  extraProducts,
  setSelectedExtraSlugs,
  subtotalCents,
  leadId,
  form,
  error,
  setError,
  submitting,
  setSubmitting,
  downsellProduct,
  onSuccess,
}: {
  product: Product;
  extraProducts: Product[];
  setSelectedExtraSlugs: Dispatch<SetStateAction<string[]>>;
  subtotalCents: number;
  leadId: string | null;
  form: { fullName: string; email: string; phone: string };
  error: string | null;
  setError: (value: string | null) => void;
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
  downsellProduct: Product | null;
  onSuccess: (totalCents: number, currency: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [showDownsell, setShowDownsell] = useState(false);
  const [downsellResolved, setDownsellResolved] = useState(false);

  async function handlePay(extraSlugsOverride?: string[]) {
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setError(null);
    setSubmitting(true);
    try {
      const extraProductSlugs = extraSlugsOverride ?? extraProducts.map((extra) => extra.slug);
      const response = await fetch(`${env.apiUrl}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          leadId,
          email: form.email,
          fullName: form.fullName,
          extraProductSlugs,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.clientSecret) throw new Error("No se pudo procesar el pago. Intenta de nuevo.");

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: form.fullName, email: form.email },
        },
      });

      if (result.error) {
        throw new Error(result.error.message ?? "No se pudo procesar el pago. Intenta de nuevo.");
      }
      if (result.paymentIntent?.status !== "succeeded") {
        throw new Error("No se pudo procesar el pago. Intenta de nuevo.");
      }

      onSuccess(data.totalCents, data.currency);
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : "No se pudo procesar el pago. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  // La 3ª oferta (downsell) siempre aparece la primera vez que se hace clic en
  // pagar, sin importar si la 2ª oferta fue aceptada o no. Al resolverla, el
  // carrito se actualiza y el pago continúa automáticamente (sin un segundo clic).
  function handlePayButtonClick() {
    if (downsellProduct && !downsellResolved) {
      setShowDownsell(true);
      return;
    }
    handlePay();
  }

  function acceptDownsell() {
    setShowDownsell(false);
    setDownsellResolved(true);
    if (!downsellProduct) return;

    trackEvent("AddToCart", {
      customData: { content_name: downsellProduct.name, value: downsellProduct.price_cents / 100, currency: product.currency },
    });
    setSelectedExtraSlugs((current) => (current.includes(downsellProduct.slug) ? current : [...current, downsellProduct.slug]));
    handlePay([...extraProducts.map((extra) => extra.slug), downsellProduct.slug]);
  }

  function declineDownsell() {
    setShowDownsell(false);
    setDownsellResolved(true);
    handlePay(extraProducts.map((extra) => extra.slug));
  }

  return (
    <>
      <Card className="mt-6" hoverable={false} padding="p-8">
        <h2 className="text-lg font-bold text-brand-900">Resumen del pedido</h2>
        <div className="mt-4 space-y-4 text-sm">
          <OrderLineItem
            name={product.name}
            description={product.description}
            imagePath={product.image_path}
            priceCents={product.price_cents}
            currency={product.currency}
          />
          {extraProducts.map((extra) => (
            <OrderLineItem
              key={extra.slug}
              name={extra.name}
              description={extra.description}
              imagePath={extra.image_path}
              priceCents={extra.price_cents}
              currency={product.currency}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-brand-100 pt-4">
          <span className="text-base font-bold text-brand-900">Total</span>
          <span className="text-2xl font-extrabold text-brand-900">{formatPrice(subtotalCents, product.currency)}</span>
        </div>

        <div className="mt-6">
          <label className="mb-1.5 block text-sm font-medium text-brand-900">Datos de tu tarjeta</label>
          <div className="rounded-lg border border-slate-300 bg-white px-3 py-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex justify-center">
          <Button size="lg" className="w-64" onClick={handlePayButtonClick} disabled={submitting || !stripe}>
            {submitting ? "Procesando..." : "Pagar"}
          </Button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-500" strokeWidth={2} />
          <span>Pago 100% seguro y encriptado</span>
        </div>
        <p className="mt-2 text-center text-xs text-slate-400">Pago procesado por Stripe.</p>
      </Card>

      {showDownsell && downsellProduct ? (
        <Modal title="¡Espera! Oferta especial" onClose={declineDownsell} closeLabel="Cerrar" maxWidthClassName="max-w-xl">
          <ProductOffer offerProduct={downsellProduct} currency={product.currency} onAccept={acceptDownsell} onDecline={declineDownsell} />
        </Modal>
      ) : null}
    </>
  );
}

export function CheckoutExperience({
  product,
  upsellProduct,
  downsellProduct,
}: {
  product: Product;
  upsellProduct: Product | null;
  downsellProduct: Product | null;
}) {
  const [step, setStep] = useState<Step>("presentation");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [selectedExtraSlugs, setSelectedExtraSlugs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderTotalCents, setOrderTotalCents] = useState<number | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellResolved, setUpsellResolved] = useState(false);

  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});

  const stepLabels = ["Producto", "Tus datos", "Pago"];
  const currentStepNumber = step === "presentation" ? 1 : step === "form" ? 2 : 3;

  useEffect(() => {
    trackEvent("InitiateCheckout", {
      customData: { content_name: product.name, product_slug: product.slug, value: product.price_cents / 100, currency: product.currency },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // El pop-up del upsell aparece un momento después de llegar al paso de
  // pago (checkout), no apenas carga la página.
  useEffect(() => {
    if (step !== "pay" || !upsellProduct || upsellResolved) return;
    const timer = setTimeout(() => setShowUpsell(true), 500);
    return () => clearTimeout(timer);
  }, [step, upsellProduct, upsellResolved]);

  // El producto principal y cada oferta aceptada (upsell y/o downsell) se
  // suman: ninguna reemplaza a otra.
  const acceptedExtraProducts = useMemo(() => {
    const list: Product[] = [];
    if (upsellProduct && selectedExtraSlugs.includes(upsellProduct.slug)) list.push(upsellProduct);
    if (downsellProduct && selectedExtraSlugs.includes(downsellProduct.slug)) list.push(downsellProduct);
    return list;
  }, [upsellProduct, downsellProduct, selectedExtraSlugs]);

  const subtotalCents = useMemo(
    () => product.price_cents + acceptedExtraProducts.reduce((sum, extra) => sum + extra.price_cents, 0),
    [product.price_cents, acceptedExtraProducts]
  );

  function acceptUpsell() {
    if (!upsellProduct) return;
    setSelectedExtraSlugs((current) => [...current, upsellProduct.slug]);
    trackEvent("AddToCart", {
      customData: { content_name: upsellProduct.name, value: upsellProduct.price_cents / 100, currency: product.currency },
    });
    setUpsellResolved(true);
    setShowUpsell(false);
  }

  function declineUpsell() {
    setUpsellResolved(true);
    setShowUpsell(false);
  }

  function validateLeadForm() {
    const errors: { fullName?: string; email?: string; phone?: string } = {};
    if (!form.fullName.trim()) {
      errors.fullName = "Este campo es obligatorio.";
    }
    if (!form.email.trim()) {
      errors.email = "Este campo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Ingresa un correo electrónico válido.";
    }
    if (form.phone && form.phone.replace(/\D/g, "").length < 8) {
      errors.phone = "Ingresa un número de teléfono válido.";
    }
    return errors;
  }

  async function handleLeadSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const errors = validateLeadForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`${env.apiUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: product.slug, ...form }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error("No se pudo guardar tus datos. Intenta de nuevo.");

      setLeadId(data.leadId);
      trackEvent("Lead", {
        email: form.email,
        phone: form.phone,
        customData: { content_name: product.name, product_slug: product.slug },
      });

      setStep("pay");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar tus datos. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePaySuccess(totalCents: number, currency: string) {
    setOrderTotalCents(totalCents);
    trackEvent("Purchase", {
      email: form.email,
      phone: form.phone,
      customData: { content_name: product.name, value: totalCents / 100, currency },
    });
    setStep("success");
  }

  return (
    <main className="min-h-screen bg-brand-50 py-10">
      <Container className="max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-brand-600 hover:text-brand-800">
          ← Volver
        </Link>

        {step !== "presentation" ? (
          <Card className="mt-6" hoverable={false}>
            <p className="text-sm font-semibold text-brand-500">Estás por adquirir</p>
            <p className="text-lg font-bold text-brand-900">{product.name}</p>
          </Card>
        ) : null}

        {step === "presentation" ? (
          <Card className="mt-6" hoverable={false}>
            <div className="flex flex-col gap-6 sm:flex-row">
              {product.image_path ? (
                <div className="sm:w-96 sm:shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image_path}
                    alt={product.name}
                    className="h-[32rem] w-full rounded-xl object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col">
                <div>
                  <h1 className="text-2xl font-bold text-brand-900">{product.name}</h1>
                  {product.headline ? <p className="mt-2 text-lg font-semibold text-brand-700">{product.headline}</p> : null}
                  {product.subheadline ? <p className="mt-1 text-slate-600">{product.subheadline}</p> : null}
                  {product.description ? <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p> : null}
                  <div className="mt-6 flex items-center gap-3">
                    <span className="text-2xl font-extrabold text-brand-900">{formatPrice(product.price_cents, product.currency)}</span>
                    {product.compare_at_price_cents ? (
                      <span className="text-base text-red-600 line-through">
                        {formatPrice(product.compare_at_price_cents, product.currency)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <Button size="lg" className="mt-6 self-center" onClick={() => setStep("form")}>
                  <span className="text-xl">¡Sí, lo quiero ahora!</span>
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {step === "form" ? (
          <Card className="mt-6" hoverable={false}>
            <h1 className="text-xl font-bold text-brand-900">Tus datos</h1>
            <p className="mt-1 text-sm text-slate-500">Los usaremos para enviarte el acceso y novedades del programa.</p>
            <form onSubmit={handleLeadSubmit} className="mt-6 space-y-4">
              <Input
                id="fullName"
                label="Nombre completo"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                error={fieldErrors.fullName}
              />
              <Input
                id="email"
                type="email"
                label="Correo electrónico"
                placeholder="Ej: nombre@correo.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={fieldErrors.email}
              />
              <Input
                id="phone"
                type="tel"
                label="Teléfono (WhatsApp)"
                placeholder="Ej: +52 55 1234 5678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: formatPhoneNumber(e.target.value) })}
                error={fieldErrors.phone}
              />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Guardando..." : "Continuar"}
              </Button>
            </form>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-500" strokeWidth={2} />
              <span>Tus datos están 100% seguros y encriptados</span>
            </div>
          </Card>
        ) : null}

        {step === "pay" && stripePromise ? (
          <Elements stripe={stripePromise}>
            <PayStep
              product={product}
              extraProducts={acceptedExtraProducts}
              setSelectedExtraSlugs={setSelectedExtraSlugs}
              subtotalCents={subtotalCents}
              leadId={leadId}
              form={form}
              error={error}
              setError={setError}
              submitting={submitting}
              setSubmitting={setSubmitting}
              downsellProduct={downsellProduct}
              onSuccess={handlePaySuccess}
            />
          </Elements>
        ) : null}

        {step === "pay" && !stripePromise ? (
          <Card className="mt-6" hoverable={false}>
            <p className="text-sm text-red-600">
              El pago no está disponible en este momento. Por favor, contáctanos.
            </p>
          </Card>
        ) : null}

        {step === "success" ? (
          <Card className="mt-6 text-center" hoverable={false}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <CheckIcon className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-brand-900">¡Pago exitoso!</h1>
            <p className="mt-2 text-sm text-slate-600">
              Total pagado: {orderTotalCents !== null ? formatPrice(orderTotalCents, product.currency) : ""}
            </p>
            <p className="mt-1 text-xs text-slate-500">Revisa tu correo: te enviamos el acceso a tu programa.</p>
            <Link href="/" className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-800">
              Volver al inicio
            </Link>
          </Card>
        ) : null}

        {step !== "success" ? (
          <div className="mt-6">
            <Stepper labels={stepLabels} current={currentStepNumber} />
          </div>
        ) : null}
      </Container>

      {showUpsell && upsellProduct ? (
        <Modal title="¡Oferta especial!" onClose={declineUpsell} closeLabel="Cerrar" maxWidthClassName="max-w-xl">
          <ProductOffer offerProduct={upsellProduct} currency={product.currency} onAccept={acceptUpsell} onDecline={declineUpsell} />
        </Modal>
      ) : null}
    </main>
  );
}
