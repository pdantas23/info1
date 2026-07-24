"use client";

import { useEffect, useState } from "react";
import { Check, Clock, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { formatPrice } from "@/lib/format";
import { FacebookComments, PLACEHOLDER_COMMENTS } from "@/components/ui/FacebookComments";
import { INCLUDES, VIDEO_TESTIMONIALS, FAQS } from "@/lib/content/movilidad-total";
import type { Product } from "@/types";

const ANSWERS_STORAGE_KEY = "quiz_movilidad_total";
const NAME_STORAGE_KEY = "quiz_movilidad_total_name";
const COUNTDOWN_START_SECONDS = 15 * 60;

type QuizAnswers = Record<string, string | string[] | number>;
type Tier = "base" | "popular" | "complete";
type PricingTier = { key: Tier; label: string; products: Product[]; highlight: boolean };

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// Usada tanto en la sección "Oferta" como en el cierre final — mismas tres
// opciones de precio en ambos lugares. Las tarjetas son una selección (no
// enlaces directos): el plan elegido acá es el que se lleva al checkout, ahí
// incluido el botón "Comenzar ahora" de esta misma grilla.
function PricingGrid({
  tiers,
  currency,
  selectedTier,
  onSelectTier,
  checkoutHrefForTier,
}: {
  tiers: PricingTier[];
  currency: string;
  selectedTier: Tier;
  onSelectTier: (tier: Tier) => void;
  checkoutHrefForTier: (tier: Tier) => string;
}) {
  return (
    <>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3 sm:items-stretch">
        {tiers.map((tier) => {
          const isSelected = tier.key === selectedTier;
          const totalPrice = tier.products.reduce((sum, p) => sum + p.price_cents, 0);
          const totalCompare = tier.products.reduce((sum, p) => sum + (p.compare_at_price_cents ?? p.price_cents), 0);
          return (
            <button
              key={tier.key}
              type="button"
              onClick={() => onSelectTier(tier.key)}
              aria-pressed={isSelected}
              className={`relative rounded-2xl border-2 bg-white p-6 text-center shadow-[0_1px_2px_rgba(15,46,42,0.05)] transition-all ${
                tier.highlight ? "sm:z-10 sm:scale-105" : ""
              } ${
                isSelected ? "border-brand-600 shadow-lg sm:-translate-y-2" : "border-brand-100/70 hover:border-brand-300"
              }`}
            >
              {tier.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">
                  Más popular
                </span>
              ) : null}
              <span
                className={`absolute right-4 top-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected ? "border-brand-600 bg-brand-600" : "border-slate-300"
                }`}
              >
                {isSelected ? <Check className="h-3 w-3 text-white" strokeWidth={3} /> : null}
              </span>
              <p className="text-sm font-semibold text-slate-500">{tier.label}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-2xl font-extrabold text-brand-900">{formatPrice(totalPrice, currency)}</span>
                {totalCompare > totalPrice ? (
                  <span className="text-sm text-red-600 line-through">{formatPrice(totalCompare, currency)}</span>
                ) : null}
              </div>
              <ul className="mt-4 space-y-1.5 text-left text-sm text-slate-600">
                {tier.products.map((p) => (
                  <li key={p.slug} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.5} />
                    <span>{p.name}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-6 max-w-xs">
        <LinkButton href={checkoutHrefForTier(selectedTier)} size="lg" className="w-full">
          Comenzar ahora
        </LinkButton>
      </div>
    </>
  );
}

export function ResultadoExperience({ mainProduct, extraProducts }: { mainProduct: Product; extraProducts: Product[] }) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_START_SECONDS);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  // El plan seleccionado en las tarjetas de precio es el que se lleva al
  // checkout — tanto desde los botones de la propia grilla como desde la
  // barra fija. Por defecto el nivel "popular" ($22.98 = base + downsell).
  const [selectedTier, setSelectedTier] = useState<Tier>("popular");

  const checkoutHrefForTier = (tier: Tier) => `/checkout/${mainProduct.slug}?tier=${tier}`;
  const checkoutHref = checkoutHrefForTier(selectedTier);
  const downsellProduct = extraProducts.find((p) => p.offer_role === "downsell") ?? null;
  const upsellProduct = extraProducts.find((p) => p.offer_role === "upsell") ?? null;

  const pricingTiers: PricingTier[] = [
    { key: "base", label: "Más económico", products: [mainProduct], highlight: false },
    {
      key: "popular",
      label: "Más popular",
      products: downsellProduct ? [mainProduct, downsellProduct] : [mainProduct],
      highlight: true,
    },
    {
      key: "complete",
      label: "Mejor valor",
      products: downsellProduct && upsellProduct ? [mainProduct, downsellProduct, upsellProduct] : [mainProduct],
      highlight: false,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  // Se lee después de montar (100% en el cliente) — sessionStorage no existe
  // en el server, y leerlo antes causaría un mismatch de hidratación. Es una
  // sincronización única con un sistema externo real (el storage del
  // navegador), no hay otro momento posible para esta lectura.
  useEffect(() => {
    try {
      const storedName = sessionStorage.getItem(NAME_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de sessionStorage al montar, ver comentario arriba.
      if (storedName) setFirstName(storedName.trim().split(/\s+/)[0]);

      const rawAnswers = sessionStorage.getItem(ANSWERS_STORAGE_KEY);
      if (rawAnswers) setAnswers(JSON.parse(rawAnswers));
    } catch {
      // Sin quiz previo (ej. alguien llegó directo al link) — se muestran los valores genéricos.
    }
  }, []);

  const zonaDolor = Array.isArray(answers?.zona_dolor) && answers.zona_dolor.length > 0 ? answers.zona_dolor.join(", ") : "molestias articulares";
  const mobilidadHoy = typeof answers?.mobilidad_hoy === "number" ? answers.mobilidad_hoy : null;
  const metaTexto = typeof answers?.si_desapareciera === "string" ? answers.si_desapareciera : "moverte sin dolor";

  return (
    <main className="bg-background text-foreground">
      {/* Barra fija: urgencia real (esta sesión) + acceso rápido a la oferta */}
      <div className="sticky top-0 z-50 border-b border-red-200 bg-red-50">
        <Container className="flex items-center justify-between gap-3 py-2.5">
          <div className="flex items-center gap-2 text-red-700">
            <Clock className="h-4 w-4 shrink-0 animate-pulse" strokeWidth={2.5} />
            <p className="text-sm font-bold leading-tight">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-red-600 sm:inline sm:text-xs">
                Oferta especial{" "}
              </span>
              termina en {formatCountdown(secondsLeft)}
            </p>
          </div>
          <LinkButton href={checkoutHref} size="md">
            Ver mi plan
          </LinkButton>
        </Container>
      </div>

      {/* Hero personalizado */}
      <Section className="pb-8 pt-10 sm:pt-14">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-brand-900 sm:text-5xl">
            {firstName ? `${firstName}, tu` : "Tu"} plan para <span className="text-brand-600">moverte sin dolor</span> está listo
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Basado en tus respuestas, preparamos un plan enfocado en tu situación actual.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <Card hoverable={false} className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Hoy</p>
            <p className="mt-2 text-slate-700">Molestias en: {zonaDolor}</p>
            {mobilidadHoy !== null ? <p className="mt-1 text-slate-700">Movilidad actual: {mobilidadHoy}/10</p> : null}
          </Card>
          <Card hoverable={false} className="border-brand-200 bg-brand-50 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Tu meta</p>
            <p className="mt-2 font-medium text-brand-900">{metaTexto}</p>
          </Card>
        </div>
      </Section>

      {/* Presentación del producto */}
      <Section className="bg-brand-50/60">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">
            {mainProduct.name}: tu programa para recuperar la movilidad
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Un método claro y progresivo, pensado para adultos que quieren volver a moverse sin dolor, con rutinas
            cortas que puedes hacer desde casa, a tu ritmo, sin equipos ni gimnasio.
          </p>
        </div>
        {mainProduct.image_path ? (
          <div className="mx-auto mt-8 max-w-xl overflow-hidden rounded-2xl shadow-xl ring-1 ring-brand-900/10 sm:max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainProduct.image_path} alt={mainProduct.name} className="h-auto w-full object-contain" />
          </div>
        ) : null}
      </Section>

      {/* Oferta */}
      <Section id="oferta">
        <p className="text-center text-sm font-semibold text-brand-600">Precio especial por tiempo limitado</p>
        <h2 className="mt-2 text-center font-heading text-2xl font-extrabold text-brand-900 sm:text-3xl">Elige tu plan</h2>

        <PricingGrid
          tiers={pricingTiers}
          currency={mainProduct.currency}
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
          checkoutHrefForTier={checkoutHrefForTier}
        />

        <div className="mt-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fotos/garantias.png" alt="Compra 100% segura y protegida" className="h-14 w-auto sm:h-16" />
        </div>
      </Section>

      {/* Qué incluye */}
      <Section className="bg-brand-50/60">
        <SectionHeading title="Todo lo que recibes al inscribirte" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {INCLUDES.map((item) => (
            <Card key={item.title} className="flex items-start gap-4">
              <item.icon className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" strokeWidth={1.75} />
              <div>
                <p className="font-bold text-brand-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Comentarios */}
      <Section>
        <SectionHeading title="Lo que dice la gente" />
        <div className="mt-10">
          <FacebookComments comments={PLACEHOLDER_COMMENTS} />
        </div>
      </Section>

      {/* Testimonios */}
      <Section className="bg-brand-50/60">
        <SectionHeading title="Lo que dicen quienes ya empezaron" />
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-2">
          {VIDEO_TESTIMONIALS.map((testimonial) => (
            <div key={testimonial.file}>
              <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-brand-900/10">
                <video
                  className="testimonial-video aspect-video w-full bg-brand-900 object-cover"
                  src={`/videos/movilidad-total/${testimonial.file}.mp4`}
                  poster={`/videos/movilidad-total/${testimonial.file}-poster.jpg`}
                  controls
                  controlsList="nofullscreen noremoteplayback"
                  disablePictureInPicture
                  playsInline
                  preload="metadata"
                />
              </div>
              <p className="mt-3 text-center font-semibold text-brand-900">{testimonial.name}</p>
              <p className="text-center text-sm text-slate-500">{testimonial.location}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <SectionHeading title="Todo lo que necesitas saber" />
        <div className="mx-auto mt-10 max-w-2xl">
          <Accordion items={FAQS} />
        </div>
      </Section>

      {/* Garantía */}
      <Section className="bg-brand-900 text-white">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
          <ShieldCheck className="h-12 w-12 text-brand-300" strokeWidth={1.5} />
          <h2 className="text-2xl font-extrabold sm:text-3xl">Garantía de 7 días</h2>
          <p className="text-brand-100">
            Si dentro de los primeros 7 días sientes que el programa no es para ti, te devolvemos tu dinero. Sin
            complicaciones.
          </p>
        </div>
      </Section>

      {/* Cierre final */}
      <Section className="bg-brand-50/60">
        <h2 className="text-center text-2xl font-extrabold text-brand-900 sm:text-3xl">Empieza hoy mismo</h2>
        <p className="mt-2 text-center text-slate-600">Tu movilidad no puede esperar más.</p>

        <PricingGrid
          tiers={pricingTiers}
          currency={mainProduct.currency}
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
          checkoutHrefForTier={checkoutHrefForTier}
        />
      </Section>

      <footer className="border-t border-brand-100 bg-white py-10 text-sm text-slate-500">
        <Container className="flex flex-col items-center gap-4 text-center">
          <span className="text-base font-extrabold text-brand-800">Movilidad Total</span>
          <p>© 2026 Movilidad Total. Todos los derechos reservados.</p>
        </Container>
      </footer>
    </main>
  );
}
