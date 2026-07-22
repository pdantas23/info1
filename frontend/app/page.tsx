"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  PersonStanding,
  StretchHorizontal,
  Wind,
  Sparkles,
  Home,
  PiggyBank,
  Timer,
  Zap,
  CalendarClock,
  Footprints,
  BookOpenCheck,
  HeartHandshake,
  ListChecks,
  Award,
  Route,
  FileDown,
  MailCheck,
  Infinity,
  MonitorSmartphone,
  ShieldCheck,
  CreditCard,
  LifeBuoy,
  Globe,
  Check,
  X,
} from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { HeroVideo } from "@/components/ui/HeroVideo";
import { FacebookComments, PLACEHOLDER_COMMENTS } from "@/components/ui/FacebookComments";
import { trackEvent } from "@/lib/meta/pixel";

const PRODUCT_SLUG = "movilidad-total";
const CHECKOUT_HREF = `/checkout/${PRODUCT_SLUG}`;

// Controla qué secciones se renderizan — el contenido nunca se borra, solo
// se deja de mostrar poniendo la flag en `false`. Orden pensado para
// construir confianza antes de pedir datos: prueba rápida (métricas) ->
// valor de la oferta (beneficios/para quién es/qué incluye) -> prueba social
// con contexto (comentarios/testimonios) -> diferenciación y cierre de
// objeciones (por qué elegirnos/garantía/faq) -> CTA final.
const SECTIONS_ACTIVE = {
  metricas: false,
  beneficios: true,
  paraQuienEs: true,
  queIncluye: true,
  porQueElegirnos: true,
  garantia: true,
  faq: true,
  cierreFinal: true,
};

const BENEFITS = [
  { title: "Mayor movilidad", description: "Recupera tu rango de movimiento natural.", icon: PersonStanding },
  { title: "Más flexibilidad", description: "Músculos y articulaciones más libres.", icon: StretchHorizontal },
  { title: "Menos rigidez", description: "Reduce la tensión acumulada del día.", icon: Wind },
  { title: "Ejercicios fáciles", description: "Movimientos simples y fáciles de seguir.", icon: Sparkles },
  { title: "Desde casa", description: "Sin desplazamientos ni gimnasios.", icon: Home },
  { title: "Sin equipos costosos", description: "Todo con tu peso corporal.", icon: PiggyBank },
  { title: "Rutinas cortas", description: "Entre 10 y 15 minutos al día.", icon: Timer },
  { title: "Acceso inmediato", description: "Empieza en minutos tras tu compra.", icon: Zap },
  { title: "Disponible 24/7", description: "Practica cuando tú quieras.", icon: CalendarClock },
  { title: "Paso a paso", description: "Estructura clara semana a semana.", icon: Footprints },
  { title: "Fácil de seguir", description: "Explicaciones sencillas y claras.", icon: BookOpenCheck },
  { title: "Ideal para adultos", description: "Diseñado pensando en ti.", icon: HeartHandshake },
];

const INCLUDES = [
  { title: "Programa completo", description: "Método estructurado semana a semana para avanzar sin frustrarte.", icon: ListChecks },
  { title: "Contenido de calidad", description: "Todo pensado para que veas resultados reales, sin complicaciones.", icon: Award },
  { title: "Guía paso a paso", description: "Sabrás exactamente qué hacer cada día, sin adivinar.", icon: Route },
  { title: "Material digital", description: "PDFs descargables, calendario y hojas de seguimiento.", icon: FileDown },
  { title: "Acceso inmediato", description: "Recibe tus accesos en tu correo justo después de pagar.", icon: MailCheck },
  { title: "Acceso ilimitado", description: "Sin fecha de vencimiento. Es tuyo para siempre.", icon: Infinity },
  { title: "Multi-dispositivo", description: "Compatible con celular, tablet y computadora.", icon: MonitorSmartphone },
];

const AUDIENCE = [
  "Adultos que sienten rigidez o molestias al moverse.",
  "Personas que pasan muchas horas sentadas.",
  "Quienes quieren volver a caminar, agacharse o subir escaleras sin dolor.",
  "Adultos activos que buscan prevenir lesiones.",
  "Personas que prefieren entrenar en casa a su ritmo.",
  "Quienes ya probaron otras cosas y no vieron resultados.",
];

const COMPARISON = [
  { feature: "Diseñado para adultos", ours: true },
  { feature: "Rutinas cortas (10–15 min)", ours: true },
  { feature: "Sin equipos ni gimnasio", ours: true },
  { feature: "Acceso inmediato y de por vida", ours: true },
  { feature: "Método paso a paso", ours: true },
  { feature: "Soporte incluido", ours: true },
  { feature: "Contenido genérico sin orden", ours: false },
  { feature: "Suscripciones caras mensuales", ours: false },
];

const VIDEO_TESTIMONIALS = [
  { file: "relato1", name: "Verónica M.", location: "Guadalajara, México" },
  { file: "relato2", name: "Daniela F.", location: "Medellín, Colombia" },
];

const GUARANTEES = [
  { title: "Compra segura", description: "Encriptación SSL de extremo a extremo.", icon: ShieldCheck },
  { title: "Pago protegido", description: "Procesadores reconocidos internacionalmente.", icon: CreditCard },
  { title: "Acceso inmediato", description: "Recibes tus accesos justo después de pagar.", icon: Zap },
  { title: "Soporte", description: "Estamos para ayudarte en el proceso.", icon: LifeBuoy },
  { title: "100% digital", description: "Sin envíos, sin esperas, todo online.", icon: Globe },
];

const FAQS = [
  { question: "¿Cómo recibo el acceso después de pagar?", answer: "Recibirás un correo automático con tus datos de acceso justo después de completar la compra. Podrás empezar en minutos." },
  { question: "¿Necesito experiencia previa?", answer: "No. El programa está pensado desde cero, con explicaciones sencillas y progresivas." },
  { question: "¿Necesito equipos o material especial?", answer: "No hace falta nada. Los ejercicios se realizan con tu peso corporal y en cualquier espacio de tu casa." },
  { question: "¿Cuánto tiempo tengo que dedicar al día?", answer: "Entre 10 y 15 minutos son suficientes para ver resultados si eres constante." },
  { question: "¿Puedo verlo desde el celular?", answer: "Sí. El programa es compatible con celular, tablet y computadora." },
  { question: "¿El acceso caduca?", answer: "No. Una vez lo compras, el acceso es ilimitado y de por vida." },
  { question: "¿Es apto para personas mayores?", answer: "Sí, está diseñado especialmente pensando en adultos. Aun así, si tienes una condición médica, consulta a tu médico." },
  { question: "¿Qué pasa si no tengo tiempo todos los días?", answer: "Puedes seguir el programa a tu ritmo. Los avances quedan guardados en tu área privada." },
  { question: "¿El pago es seguro?", answer: "Sí. Usamos procesadores certificados con encriptación SSL. Tus datos están totalmente protegidos." },
  { question: "¿Qué métodos de pago aceptan?", answer: "Aceptamos las principales tarjetas de crédito, débito y otros métodos según tu país." },
];

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

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <circle cx="20" cy="20" r="20" fill="currentColor" />
      <path
        d="M9 25c3-8.5 8-13 15-11.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M13 14c4 7.5 8.5 10.5 16 8.5"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="27.5" cy="13.5" r="2.3" fill="white" />
    </svg>
  );
}

export default function LandingPage() {
  const [showFloatingCta, setShowFloatingCta] = useState(false);

  useEffect(() => {
    trackEvent("ViewContent", { customData: { content_name: "Movilidad Total", product_slug: PRODUCT_SLUG } });
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowFloatingCta(window.scrollY > 600);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="bg-background pt-16 text-foreground">
      {/* Barra superior */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-brand-100 bg-background/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9 text-brand-900" />
            <span className="font-heading text-lg font-bold tracking-tight text-brand-900">Movilidad Total</span>
          </div>
        </Container>
      </header>

      {/* Botón flotante */}
      <div
        className={`fixed bottom-4 right-4 z-50 transition-all duration-300 sm:bottom-6 sm:right-6 ${
          showFloatingCta ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <LinkButton href={CHECKOUT_HREF} size="md">
          ¡Comenzar ahora!
        </LinkButton>
      </div>

      {/* Hero */}
      <Section className="relative overflow-hidden pt-12 sm:pt-16">
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-96 w-96 -translate-x-1/2 animate-glow-pulse rounded-full bg-accent-400/25 blur-3xl"
          aria-hidden="true"
        />

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-10">
          <div className="animate-fade-up text-center">
            <h1 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-brand-900 sm:text-5xl">
              Recupera tu{" "}
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 bg-clip-text text-transparent">
                movilidad
              </span>{" "}
              y vuelve a disfrutar de una vida sin dolor.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
              Descubre un programa práctico diseñado para ayudarte a mejorar tu movilidad, reducir las molestias
              articulares y recuperar la confianza para realizar tus actividades diarias.
            </p>
          </div>

          <div className="relative mx-auto w-full animate-fade-up [animation-delay:150ms]">
            <div
              className="absolute -inset-4 animate-glow-pulse rounded-[2rem] bg-gradient-to-tr from-brand-400/30 via-accent-400/25 to-transparent blur-2xl"
              aria-hidden="true"
            />
            <HeroVideo />
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-3">
              <div className="flex -space-x-3">
                {["/fotos/avatar-1.jpg", "/fotos/avatar-2.jpg", "/fotos/avatar-3.jpg"].map((src) => (
                  <span key={src} className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-background">
                    <Image src={src} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-bold text-brand-900">+10.000</span> personas activas
              </p>
            </div>

            <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5 text-center">
              <LinkButton href={CHECKOUT_HREF} size="lg">
                ¡Quiero comenzar ahora!
              </LinkButton>
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
                <ShieldCheck className="h-4 w-4 text-brand-600" strokeWidth={2} />
                <span>Compra 100% segura y protegida</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Métricas */}
      {SECTIONS_ACTIVE.metricas ? (
        <Section className="border-y border-brand-100 bg-background py-5 sm:py-6">
          <div className="grid grid-cols-2 gap-y-6 text-center sm:grid-cols-4">
            {[
              { value: "10.000+", label: "Alumnos activos" },
              { value: "4.9", label: "Calificación media" },
              { value: "98%", label: "Satisfacción" },
              { value: "24h", label: "Acceso disponible" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="[font-family:var(--font-stat-serif)] text-2xl font-bold text-brand-800 sm:text-3xl">{stat.value}</p>
                <p className="mt-2 text-sm font-medium uppercase tracking-wider text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Beneficios */}
      {SECTIONS_ACTIVE.beneficios ? (
        <Section>
          <SectionHeading
            eyebrow="Beneficios"
            title="Todo lo que vas a lograr"
            description="Un método pensado para adultos que quieren volver a moverse con confianza."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <Card key={benefit.title} className="flex items-start gap-4">
                <benefit.icon className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" strokeWidth={1.75} />
                <div>
                  <p className="font-bold text-brand-900">{benefit.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{benefit.description}</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="mx-auto mt-10 flex w-full max-w-sm flex-col items-center gap-5 text-center">
            <LinkButton href={CHECKOUT_HREF} size="lg">
              ¡Quiero comenzar ahora!
            </LinkButton>
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
              <ShieldCheck className="h-4 w-4 text-brand-600" strokeWidth={2} />
              <span>Compra 100% segura y protegida</span>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Para quién es */}
      {SECTIONS_ACTIVE.paraQuienEs ? (
        <Section>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="¿Para quién es?" title="Diseñado especialmente para ti" />
              <ul className="mt-8 space-y-4">
                {AUDIENCE.map((line) => (
                  <li key={line} className="flex gap-3">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                    <span className="text-slate-700">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-xl lg:aspect-[4/5]">
              <Image
                src="/fotos/audiencia.jpg"
                alt="Adulto ejercitándose en casa"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl sm:inset-x-6 sm:bottom-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <CheckIcon className="h-5 w-5 text-brand-600" />
                </span>
                <div>
                  <p className="font-bold text-brand-900">Resultados desde la primera semana</p>
                  <p className="text-sm text-slate-500">Rutinas de 10 a 15 minutos al día</p>
                </div>
              </div>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Qué incluye */}
      {SECTIONS_ACTIVE.queIncluye ? (
        <Section className="bg-brand-900 text-white">
          <SectionHeading
            eyebrow="¿Qué incluye?"
            title="Todo lo que recibes al inscribirte"
            description="Un paquete completo para transformar tu movilidad, sin nada extra que pagar."
            tone="dark"
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {INCLUDES.map((item) => (
              <Card key={item.title} className="flex items-start gap-4 bg-white">
                <item.icon className="mt-0.5 h-6 w-6 shrink-0 text-accent-600" strokeWidth={1.75} />
                <div>
                  <p className="font-bold text-brand-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="mx-auto mt-10 flex w-full max-w-sm flex-col items-center gap-5 text-center">
            <LinkButton href={CHECKOUT_HREF} size="lg">
              ¡Quiero comenzar ahora!
            </LinkButton>
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-brand-200">
              <ShieldCheck className="h-4 w-4" strokeWidth={2} />
              <span>Compra 100% segura y protegida</span>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Comentarios */}
      <Section className="bg-brand-50/60">
        <SectionHeading eyebrow="Comentarios" title="Lo que dice la gente" />
        <div className="mt-10">
          <FacebookComments comments={PLACEHOLDER_COMMENTS} />
        </div>
      </Section>

      {/* Videos de autoridad */}
      <Section className="overflow-hidden">
        <SectionHeading eyebrow="Testimonios" title="Lo que dicen quienes ya empezaron" />
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
        <div className="mx-auto mt-10 flex w-full max-w-sm flex-col items-center gap-5 text-center">
          <LinkButton href={CHECKOUT_HREF} size="lg">
            ¡Quiero comenzar ahora!
          </LinkButton>
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
            <ShieldCheck className="h-4 w-4 text-brand-600" strokeWidth={2} />
            <span>Compra 100% segura y protegida</span>
          </div>
        </div>
      </Section>

      {/* Por qué elegirnos */}
      {SECTIONS_ACTIVE.porQueElegirnos ? (
        <Section className="bg-brand-900 text-white">
          <SectionHeading
            eyebrow="¿Por qué elegirnos?"
            title="La diferencia se nota"
            description="Comparado con lo que suelen ofrecerte por ahí."
            tone="dark"
          />
          <div className="mx-auto mt-12 max-w-2xl overflow-x-auto rounded-2xl border border-brand-100 bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-100 text-sm text-slate-500">
                  <th className="px-6 py-4 font-semibold">Característica</th>
                  <th className="px-6 py-4 text-center font-semibold text-brand-700">Nuestro programa</th>
                  <th className="px-6 py-4 text-center font-semibold">Otros</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-brand-50 last:border-0">
                    <td className="px-6 py-4 text-sm text-slate-700">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {row.ours ? (
                        <Check className="mx-auto h-5 w-5 text-brand-500" strokeWidth={2.5} />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-slate-300" strokeWidth={2.5} />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!row.ours ? (
                        <Check className="mx-auto h-5 w-5 text-slate-400" strokeWidth={2.5} />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-slate-300" strokeWidth={2.5} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mx-auto mt-10 flex w-full max-w-sm flex-col items-center gap-5 text-center">
            <LinkButton href={CHECKOUT_HREF} size="lg">
              ¡Quiero comenzar ahora!
            </LinkButton>
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-brand-200">
              <ShieldCheck className="h-4 w-4" strokeWidth={2} />
              <span>Compra 100% segura y protegida</span>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Garantía */}
      {SECTIONS_ACTIVE.garantia ? (
        <Section className="bg-brand-900 text-white">
          <SectionHeading eyebrow="Garantía" title="Compra con total tranquilidad" tone="dark" />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {GUARANTEES.map((item) => (
              <Card key={item.title} className="flex flex-col items-center bg-white text-center">
                <item.icon className="h-7 w-7 text-brand-600" strokeWidth={1.75} />
                <p className="mt-4 font-bold text-brand-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </Card>
            ))}
          </div>
          <div className="mx-auto mt-10 flex w-full max-w-sm flex-col items-center gap-5 text-center">
            <LinkButton href={CHECKOUT_HREF} size="lg">
              ¡Quiero comenzar ahora!
            </LinkButton>
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-brand-200">
              <ShieldCheck className="h-4 w-4" strokeWidth={2} />
              <span>Compra 100% segura y protegida</span>
            </div>
          </div>
        </Section>
      ) : null}

      {/* FAQ */}
      {SECTIONS_ACTIVE.faq ? (
        <Section>
          <SectionHeading eyebrow="Preguntas frecuentes" title="Todo lo que necesitas saber" />
          <div className="mx-auto mt-12 max-w-2xl">
            <Accordion items={FAQS} />
          </div>
        </Section>
      ) : null}

      {/* Cierre final */}
      {SECTIONS_ACTIVE.cierreFinal ? (
        <Section className="bg-brand-900 text-white">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Empieza hoy mismo</h2>
            <p className="mt-2 text-lg font-medium text-brand-200">Tu movilidad no puede esperar más.</p>
            <p className="mt-4 text-brand-100">
              Cada día que pasa es una oportunidad más para volver a moverte con libertad. Únete a miles de adultos que
              ya recuperaron su vida diaria.
            </p>
            <div className="mx-auto mt-8 flex w-full max-w-sm flex-col items-center gap-5">
              <LinkButton href={CHECKOUT_HREF} size="lg">
                ¡Quiero comenzar ahora!
              </LinkButton>
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-brand-200">
                <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                <span>Compra 100% segura y protegida</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-brand-200">
              <span>Pago seguro</span>
              <span>Acceso inmediato</span>
              <span>Acceso ilimitado</span>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Footer */}
      <footer className="border-t border-brand-100 bg-white py-10 text-sm text-slate-500">
        <Container className="flex flex-col items-center gap-4 text-center">
          <span className="text-base font-extrabold text-brand-800">Movilidad Total</span>
          <p>© 2026 Movilidad Total. Todos los derechos reservados.</p>
        </Container>
      </footer>
    </main>
  );
}
