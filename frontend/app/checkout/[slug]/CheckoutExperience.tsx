"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatPrice } from "@/lib/format";
import { trackEvent } from "@/lib/meta/pixel";
import { env } from "@/lib/env";
import type { Product } from "@/types";

type Tier = "base" | "popular" | "complete";

// Deben coincidir exactamente con las claves usadas en QuizExperience.tsx al
// finalizar el quiz — es la única forma de traspasar el lead ya capturado
// hasta este checkout sin pedir los datos de nuevo.
const NAME_STORAGE_KEY = "quiz_movilidad_total_name";
const EMAIL_STORAGE_KEY = "quiz_movilidad_total_email";
const LEAD_ID_STORAGE_KEY = "quiz_movilidad_total_lead_id";

export type LocalizedPrice = { priceCents: number; compareAtPriceCents: number | null };
export type Localization = {
  country: string;
  currency: string;
  rate: number;
  prices: Record<string, LocalizedPrice>;
};

// Sobrepõe o preço/moeda em USD do catálogo pelos valores já convertidos pro
// país do visitante — mantém o resto do produto (nome, imagem, slug...)
// intacto, então o resto da UI usa esse objeto exatamente como usaria o
// produto original.
function localizeProduct(product: Product, localization: Localization): Product {
  const localized = localization.prices[product.slug];
  if (!localized) return product;
  return {
    ...product,
    price_cents: localized.priceCents,
    compare_at_price_cents: localized.compareAtPriceCents,
    currency: localization.currency,
  };
}

function ProductOffer({
  offerProduct,
  onAccept,
  onDecline,
}: {
  offerProduct: Product;
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
            <span className="text-2xl font-extrabold text-brand-900">{formatPrice(offerProduct.price_cents, offerProduct.currency)}</span>
            {offerProduct.compare_at_price_cents ? (
              <span className="text-base text-red-600 line-through">
                {formatPrice(offerProduct.compare_at_price_cents, offerProduct.currency)}
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

// Único paso del checkout: resumen del pedido + pago. Si el visitante ya
// trae email/leadId del quiz no ve ningún campo — si no, se le pide apenas
// el correo (obligatorio para /api/checkout) junto al propio botón de pagar,
// sin una pantalla separada para eso.
function OrderSummary({
  product,
  extraProducts,
  setSelectedExtraSlugs,
  subtotalCents,
  leadId,
  setLeadId,
  form,
  setForm,
  country,
  error,
  setError,
  submitting,
  setSubmitting,
  downsellProduct,
  initialDownsellResolved,
  restrictDownsellToEmptyCart,
}: {
  product: Product;
  extraProducts: Product[];
  setSelectedExtraSlugs: Dispatch<SetStateAction<string[]>>;
  subtotalCents: number;
  leadId: string | null;
  setLeadId: (value: string) => void;
  form: { fullName: string; email: string };
  setForm: Dispatch<SetStateAction<{ fullName: string; email: string }>>;
  country: string;
  error: string | null;
  setError: (value: string | null) => void;
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
  downsellProduct: Product | null;
  initialDownsellResolved: boolean;
  restrictDownsellToEmptyCart: boolean;
}) {
  const [showDownsell, setShowDownsell] = useState(false);
  const [downsellResolved, setDownsellResolved] = useState(initialDownsellResolved);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Cria la orden y redirige al Checkout hospedado por la propia Stripe: los
  // datos de pago nunca pasan por nuestro servidor.
  async function handlePay(currentLeadId: string | null, extraSlugsOverride?: string[]) {
    setError(null);
    setSubmitting(true);
    try {
      const extraProductSlugs = extraSlugsOverride ?? extraProducts.map((extra) => extra.slug);
      const response = await fetch(`${env.apiUrl}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          leadId: currentLeadId,
          email: form.email,
          fullName: form.fullName,
          extraProductSlugs,
          country,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) throw new Error("No se pudo procesar el pago. Intenta de nuevo.");

      window.location.href = data.checkoutUrl;
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : "No se pudo procesar el pago. Intenta de nuevo.");
      setSubmitting(false);
    }
  }

  // Si todavía no hay lead (nombre/correo no vinieron del quiz), lo crea acá
  // mismo antes de pagar — no hay una pantalla separada para esto.
  async function ensureLead(): Promise<string | null> {
    if (leadId) return leadId;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setEmailError("Ingresa un correo electrónico válido.");
      return null;
    }
    setEmailError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`${env.apiUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: product.slug, fullName: form.fullName, email: form.email, country }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error("No se pudo guardar tus datos. Intenta de nuevo.");
      setLeadId(data.leadId);
      trackEvent("Lead", { email: form.email, customData: { content_name: product.name, product_slug: product.slug } });
      return data.leadId as string;
    } catch (leadError) {
      setError(leadError instanceof Error ? leadError.message : "No se pudo guardar tus datos. Intenta de nuevo.");
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  // La 3ª oferta (downsell) aparece la primera vez que se hace clic en pagar,
  // sin importar si la 2ª oferta fue aceptada o no. Al resolverla, el carrito
  // se actualiza y el pago continúa automáticamente (sin un segundo clic).
  // Excepción: cuando se llega desde el quiz con un nivel ya elegido
  // (restrictDownsellToEmptyCart), el downsell solo tiene sentido si el
  // carrito sigue siendo apenas el producto base — si ya se sumó el upsell,
  // ofrecer también el downsell no encaja con lo que el visitante eligió.
  async function handlePayButtonClick() {
    const currentLeadId = await ensureLead();
    if (!currentLeadId) return;

    const shouldOfferDownsell =
      downsellProduct && !downsellResolved && (!restrictDownsellToEmptyCart || extraProducts.length === 0);
    if (shouldOfferDownsell) {
      setShowDownsell(true);
      return;
    }
    handlePay(currentLeadId);
  }

  function acceptDownsell() {
    setShowDownsell(false);
    setDownsellResolved(true);
    if (!downsellProduct) return;

    trackEvent("AddToCart", {
      customData: { content_name: downsellProduct.name, value: downsellProduct.price_cents / 100, currency: downsellProduct.currency },
    });
    setSelectedExtraSlugs((current) => (current.includes(downsellProduct.slug) ? current : [...current, downsellProduct.slug]));
    handlePay(leadId, [...extraProducts.map((extra) => extra.slug), downsellProduct.slug]);
  }

  function declineDownsell() {
    setShowDownsell(false);
    setDownsellResolved(true);
    handlePay(leadId, extraProducts.map((extra) => extra.slug));
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

        {!leadId ? (
          <div className="mt-6 space-y-3 border-t border-brand-100 pt-6">
            <Input
              id="fullName"
              label="Nombre (opcional)"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <Input
              id="email"
              type="email"
              label="Correo electrónico"
              placeholder="Ej: nombre@correo.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={emailError ?? undefined}
            />
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex justify-center">
          <Button size="lg" className="w-64" onClick={handlePayButtonClick} disabled={submitting}>
            {submitting ? "Redirigiendo..." : "Pagar"}
          </Button>
        </div>
        <div className="mt-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fotos/garantias.png" alt="Compra 100% segura y protegida" className="h-14 w-auto sm:h-16" />
        </div>
      </Card>

      {showDownsell && downsellProduct ? (
        <Modal title="¡Espera! Oferta especial" onClose={declineDownsell} closeLabel="Cerrar" maxWidthClassName="max-w-xl">
          <ProductOffer offerProduct={downsellProduct} onAccept={acceptDownsell} onDecline={declineDownsell} />
        </Modal>
      ) : null}
    </>
  );
}

export function CheckoutExperience({
  product,
  upsellProduct,
  downsellProduct,
  localization,
  initialTier,
}: {
  product: Product;
  upsellProduct: Product | null;
  downsellProduct: Product | null;
  localization: Localization;
  initialTier: Tier | null;
}) {
  const [leadId, setLeadId] = useState<string | null>(null);
  const [selectedExtraSlugs, setSelectedExtraSlugs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellResolved, setUpsellResolved] = useState(false);
  const [resolvedTier, setResolvedTier] = useState<Tier | null>(null);
  // Evita el parpadeo del formulario de correo cuando se llega desde el quiz:
  // mientras se confirma el lead guardado en sessionStorage, no se muestra
  // nada todavía. Se inicializa a partir de un prop (no de una API del
  // navegador), así que es idéntico en el render del servidor y del cliente.
  const [hydrating, setHydrating] = useState(Boolean(initialTier));

  const [form, setForm] = useState({ fullName: "", email: "" });

  const localizedProduct = useMemo(() => localizeProduct(product, localization), [product, localization]);
  const localizedUpsell = useMemo(() => (upsellProduct ? localizeProduct(upsellProduct, localization) : null), [upsellProduct, localization]);
  const localizedDownsell = useMemo(
    () => (downsellProduct ? localizeProduct(downsellProduct, localization) : null),
    [downsellProduct, localization]
  );

  useEffect(() => {
    trackEvent("InitiateCheckout", {
      customData: {
        content_name: localizedProduct.name,
        product_slug: localizedProduct.slug,
        value: localizedProduct.price_cents / 100,
        currency: localizedProduct.currency,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // El nivel (?tier=...) decide qué productos van pre-seleccionados en el
  // carrito — esto NO depende de si hay o no un lead guardado, se aplica
  // siempre que haya un nivel en la URL. Depende de `initialTier` (no solo
  // se ejecuta al montar): si el visitante navega de un nivel a otro sin
  // recarga completa (ej. vuelve a /resultado y elige otro plan), Next.js
  // puede reutilizar la misma instancia del componente — sin esta
  // dependencia, la selección del nivel nuevo nunca se aplicaría.
  useEffect(() => {
    if (!initialTier) return;

    const initialSlugs: string[] = [];
    if ((initialTier === "popular" || initialTier === "complete") && downsellProduct) initialSlugs.push(downsellProduct.slug);
    if (initialTier === "complete" && upsellProduct) initialSlugs.push(upsellProduct.slug);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza el carrito con el nivel de la URL al montar o al cambiar de nivel, ver comentario arriba.
    setSelectedExtraSlugs(initialSlugs);
    setUpsellResolved(initialTier === "complete");
    setResolvedTier(initialTier);

    // Si además hay un lead ya guardado en sessionStorage (se llegó desde el
    // quiz), se usan esos datos (nombre, correo, id del lead) para no
    // pedirlos de nuevo — esto es independiente de la selección de arriba.
    try {
      const storedLeadId = sessionStorage.getItem(LEAD_ID_STORAGE_KEY);
      const storedEmail = sessionStorage.getItem(EMAIL_STORAGE_KEY);
      const storedName = sessionStorage.getItem(NAME_STORAGE_KEY);
      if (storedLeadId && storedEmail) {
        setForm((current) => ({ ...current, fullName: storedName ?? current.fullName, email: storedEmail }));
        setLeadId(storedLeadId);
      }
    } catch {
      // sessionStorage puede fallar en modo privado — se pide el correo en pantalla.
    } finally {
      setHydrating(false);
    }
  }, [initialTier, downsellProduct, upsellProduct]);

  // El pop-up del upsell aparece un momento después de cargar la página.
  useEffect(() => {
    if (hydrating || !upsellProduct || upsellResolved) return;
    const timer = setTimeout(() => setShowUpsell(true), 500);
    return () => clearTimeout(timer);
  }, [hydrating, upsellProduct, upsellResolved]);

  // El producto principal y cada oferta aceptada (upsell y/o downsell) se
  // suman: ninguna reemplaza a otra.
  const acceptedExtraProducts = useMemo(() => {
    const list: Product[] = [];
    if (localizedUpsell && selectedExtraSlugs.includes(localizedUpsell.slug)) list.push(localizedUpsell);
    if (localizedDownsell && selectedExtraSlugs.includes(localizedDownsell.slug)) list.push(localizedDownsell);
    return list;
  }, [localizedUpsell, localizedDownsell, selectedExtraSlugs]);

  const subtotalCents = useMemo(
    () => localizedProduct.price_cents + acceptedExtraProducts.reduce((sum, extra) => sum + extra.price_cents, 0),
    [localizedProduct.price_cents, acceptedExtraProducts]
  );

  function acceptUpsell() {
    if (!upsellProduct || !localizedUpsell) return;
    setSelectedExtraSlugs((current) => [...current, upsellProduct.slug]);
    trackEvent("AddToCart", {
      customData: { content_name: localizedUpsell.name, value: localizedUpsell.price_cents / 100, currency: localizedUpsell.currency },
    });
    setUpsellResolved(true);
    setShowUpsell(false);
  }

  function declineUpsell() {
    setUpsellResolved(true);
    setShowUpsell(false);
  }

  return (
    <main className="min-h-screen bg-brand-50 py-10">
      <Container className="max-w-3xl">
        <Link href={initialTier ? "/resultado" : "/"} className="text-sm font-semibold text-brand-600 hover:text-brand-800">
          ← Volver
        </Link>

        {hydrating ? (
          <div className="mt-16 flex justify-center">
            <p className="text-sm font-medium text-slate-400">Cargando tu pedido…</p>
          </div>
        ) : (
          <OrderSummary
            product={localizedProduct}
            extraProducts={acceptedExtraProducts}
            setSelectedExtraSlugs={setSelectedExtraSlugs}
            subtotalCents={subtotalCents}
            leadId={leadId}
            setLeadId={setLeadId}
            form={form}
            setForm={setForm}
            country={localization.country}
            error={error}
            setError={setError}
            submitting={submitting}
            setSubmitting={setSubmitting}
            downsellProduct={localizedDownsell}
            initialDownsellResolved={resolvedTier === "popular" || resolvedTier === "complete"}
            restrictDownsellToEmptyCart={resolvedTier !== null}
          />
        )}
      </Container>

      {showUpsell && localizedUpsell ? (
        <Modal title="¡Oferta especial!" onClose={declineUpsell} closeLabel="Cerrar" maxWidthClassName="max-w-xl">
          <ProductOffer offerProduct={localizedUpsell} onAccept={acceptUpsell} onDecline={declineUpsell} />
        </Modal>
      ) : null}
    </main>
  );
}
