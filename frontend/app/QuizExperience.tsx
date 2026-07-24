"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WhatsAppScreen, ChatBubble, ChatBubbleSent, ChatTyping } from "@/components/ui/WhatsAppChat";
import { QUESTIONS, type Question } from "@/lib/quiz/questions";
import { env } from "@/lib/env";
import { trackEvent } from "@/lib/meta/pixel";

const PRODUCT_SLUG = "movilidad-total";
const STORAGE_KEY = "quiz_movilidad_total";
const NAME_STORAGE_KEY = "quiz_movilidad_total_name";
const EMAIL_STORAGE_KEY = "quiz_movilidad_total_email";
const LEAD_ID_STORAGE_KEY = "quiz_movilidad_total_lead_id";
const REVEAL_DELAY_MS = 900;
const RESULT_REDIRECT_DELAY_MS = 1800;

type Phase = "intro" | "question" | "calculating" | "name" | "email" | "done";
type Answers = Record<string, string | string[] | number>;

const CALCULATING_MESSAGES = [
  "Analizando tus respuestas...",
  "Identificando tus zonas de mayor tensión...",
  "Comparando con perfiles similares al tuyo...",
  "Preparando tu plan personalizado...",
];

const SCALE_VALUES = Array.from({ length: 10 }, (_, i) => i + 1);

function formatAnswer(value: string | string[] | number): string {
  return Array.isArray(value) ? value.join(", ") : String(value);
}

export function QuizExperience() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [introConfirmed, setIntroConfirmed] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [multiDraft, setMultiDraft] = useState<string[]>([]);
  const [revealing, setRevealing] = useState(false);
  const [calcMessageIndex, setCalcMessageIndex] = useState(0);
  const [name, setName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [email, setEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // El horario de cada mensaje se graba en estado (nunca leyendo el reloj
  // durante el render, que además causaría "hydration mismatch" porque el
  // servidor no conoce el huso horario de quien visita). `stampNow` se llama
  // solo desde manejadores de evento o callbacks async — nunca en el cuerpo
  // de un efecto ni durante el render — así que buildEntries() solo LEE
  // `times`, nunca lo escribe.
  const [times, setTimes] = useState<Record<string, string>>({});
  function stampNow(key: string) {
    const formatted = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTimes((prev) => ({ ...prev, [key]: formatted }));
  }

  const totalQuestions = QUESTIONS.length;
  const pendingIndex = QUESTIONS.findIndex((q) => !(q.id in answers));
  const question = pendingIndex === -1 ? null : QUESTIONS[pendingIndex];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [phase, revealing, multiDraft, name, email]);

  // Única excepción real: el primer mensaje ya está en pantalla antes de
  // cualquier clic, así que su hora solo puede fijarse al montar. El resto
  // de `stampNow` vive en manejadores de evento/callbacks, nunca acá.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- se sincroniza con el reloj real una única vez, al montar; no hay otro momento posible para el primer mensaje.
    stampNow("intro-bot");
  }, []);

  // Deja un momento para que el mensaje final se lea antes de saltar a la
  // página de resultado (ya con las respuestas + nombre guardados).
  useEffect(() => {
    if (phase !== "done") return;
    const timeout = setTimeout(() => router.push("/resultado"), RESULT_REDIRECT_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [phase, router]);

  // El timer de la pantalla "calculando" sí es un efecto legítimo (se
  // suscribe a un reloj externo).
  useEffect(() => {
    if (phase !== "calculating") return;
    const interval = setInterval(() => {
      setCalcMessageIndex((i) => Math.min(i + 1, CALCULATING_MESSAGES.length - 1));
    }, 900);
    const timeout = setTimeout(() => {
      setPhase("name");
      stampNow("name-prompt");
    }, 900 * CALCULATING_MESSAGES.length);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [phase]);

  function persistAnswers(next: Answers) {
    setAnswers(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // sessionStorage puede fallar en modo privado — no bloquea el quiz.
    }
  }

  // Único mecanismo de transición: retrasa a propósito la revelación del
  // próximo mensaje del bot (mostrando "escribiendo..." mientras tanto), para
  // que la respuesta del usuario y el siguiente mensaje no aparezcan juntos.
  function reveal(action: () => void, ms = REVEAL_DELAY_MS) {
    setRevealing(true);
    window.setTimeout(() => {
      action();
      setRevealing(false);
    }, ms);
  }

  // Tras responder, ya sabemos si la próxima parada es otra pregunta o la
  // pantalla de "calculando" — se marca la hora de lo que sea que aparezca.
  function revealNext(latestAnswers: Answers) {
    reveal(() => {
      setMultiDraft([]);
      const nextQuestion = QUESTIONS.find((q) => !(q.id in latestAnswers));
      if (nextQuestion) {
        stampNow(`q-${nextQuestion.id}`);
      } else {
        setCalcMessageIndex(0);
        setPhase("calculating");
        stampNow("calc");
      }
    });
  }

  function selectSingleOrScale(value: string | number) {
    if (!question) return;
    const next = { ...answers, [question.id]: value };
    persistAnswers(next);
    stampNow(`q-${question.id}-user`);
    revealNext(next);
  }

  function toggleMultiOption(option: string) {
    setMultiDraft((current) => (current.includes(option) ? current.filter((o) => o !== option) : [...current, option]));
  }

  function confirmMulti() {
    if (!question || multiDraft.length === 0) return;
    const next = { ...answers, [question.id]: multiDraft };
    persistAnswers(next);
    stampNow(`q-${question.id}-user`);
    revealNext(next);
  }

  function submitName(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (!name.trim()) return;
    setNameConfirmed(true);
    stampNow("name-user");
    reveal(() => {
      setPhase("email");
      stampNow("email-prompt");
    });
  }

  async function submitEmail(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`${env.apiUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: PRODUCT_SLUG, fullName: name, email }),
      });
      if (!response.ok) throw new Error("No se pudo guardar tus datos. Intenta de nuevo.");
      const data = await response.json();

      trackEvent("Lead", { email, customData: { content_name: "Movilidad Total", product_slug: PRODUCT_SLUG } });
      try {
        sessionStorage.setItem(NAME_STORAGE_KEY, name);
        sessionStorage.setItem(EMAIL_STORAGE_KEY, email);
        if (data?.leadId) sessionStorage.setItem(LEAD_ID_STORAGE_KEY, data.leadId);
      } catch {
        // sessionStorage puede fallar en modo privado — no bloquea el quiz.
      }
      setEmailConfirmed(true);
      stampNow("email-user");
      reveal(() => {
        setPhase("done");
        stampNow("done");
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar tus datos. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function QuestionControls({ q }: { q: Question }) {
    return (
      <>
        {q.type === "single" ? (
          <div className="mt-3 space-y-2">
            {q.options?.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => selectSingleOrScale(option)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-brand-900 transition-colors hover:border-brand-400 hover:bg-brand-50"
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}

        {q.type === "multi" ? (
          <div className="mt-3 space-y-2">
            {q.options?.map((option) => {
              const checked = multiDraft.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleMultiOption(option)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    checked ? "border-brand-500 bg-brand-50 text-brand-900" : "border-slate-200 bg-white text-brand-900 hover:border-brand-300"
                  }`}
                >
                  {option}
                  {checked ? <Check className="h-5 w-5 shrink-0 text-brand-600" strokeWidth={2.5} /> : null}
                </button>
              );
            })}
            <Button size="lg" className="mt-1 w-full" onClick={confirmMulti} disabled={multiDraft.length === 0}>
              Continuar
            </Button>
          </div>
        ) : null}

        {q.type === "scale" ? (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {SCALE_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => selectSingleOrScale(value)}
                className="rounded-lg border border-slate-200 bg-white py-2.5 text-center text-sm font-semibold text-brand-900 transition-colors hover:border-brand-400 hover:bg-brand-50"
              >
                {value}
              </button>
            ))}
          </div>
        ) : null}
      </>
    );
  }

  // Reconstruye la conversación completa a partir del estado actual (no hay
  // un array de historial separado). `revealing` es el único interruptor que
  // decide si el próximo mensaje del bot ya se muestra o todavía es "...".
  function buildEntries(): ReactNode[] {
    const entries: ReactNode[] = [];

    entries.push(
      <ChatBubble key="intro-bot" timestamp={times["intro-bot"]}>
        <div className="overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fotos/audiencia.jpg" alt="Adultos mayores entrenando en casa" className="aspect-[4/3] w-full object-cover" />
        </div>
        <p className="mt-2 text-[15px] leading-snug text-[#111b21]">
          Más de <strong>10.347 personas mayores de 50 años</strong> ya están siguiendo este plan para volver a moverse sin dolor.
        </p>
        {phase === "intro" && !introConfirmed ? (
          <Button
            size="lg"
            className="mt-3 w-full"
            onClick={() => {
              setIntroConfirmed(true);
              stampNow("intro-user");
              reveal(() => {
                setPhase("question");
                stampNow(`q-${QUESTIONS[0].id}`);
              });
            }}
          >
            Comenzar
          </Button>
        ) : null}
      </ChatBubble>,
    );
    if (phase === "intro" && !introConfirmed) return entries;

    entries.push(
      <ChatBubbleSent key="intro-user" timestamp={times["intro-user"]}>
        Comenzar
      </ChatBubbleSent>,
    );
    if (phase === "intro") {
      entries.push(<ChatTyping key="typing-intro" />);
      return entries;
    }

    for (let i = 0; i < totalQuestions; i++) {
      const q = QUESTIONS[i];
      if (!(q.id in answers)) {
        if (revealing) {
          entries.push(<ChatTyping key="typing-question" />);
          return entries;
        }
        entries.push(
          <ChatBubble key={`q-${q.id}`} timestamp={times[`q-${q.id}`]}>
            <h2 className="text-[15px] font-semibold text-[#111b21]">{q.question}</h2>
            <QuestionControls q={q} />
          </ChatBubble>,
        );
        return entries;
      }

      entries.push(
        <ChatBubble key={`q-${q.id}`} timestamp={times[`q-${q.id}`]}>
          <h2 className="text-[15px] font-semibold text-[#111b21]">{q.question}</h2>
        </ChatBubble>,
      );
      entries.push(
        <ChatBubbleSent key={`q-${q.id}-user`} timestamp={times[`q-${q.id}-user`]}>
          {formatAnswer(answers[q.id])}
        </ChatBubbleSent>,
      );
    }

    // Las 24 preguntas ya están respondidas.
    if (phase === "question") {
      entries.push(<ChatTyping key="typing-calc" />);
      return entries;
    }

    entries.push(
      <ChatBubble key="calc" timestamp={phase === "calculating" ? undefined : times["calc"]}>
        {phase === "calculating" ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
            <p className="text-sm font-medium text-[#111b21]">{CALCULATING_MESSAGES[calcMessageIndex]}</p>
          </div>
        ) : (
          <p className="text-[15px] text-[#111b21]">{CALCULATING_MESSAGES[CALCULATING_MESSAGES.length - 1]}</p>
        )}
      </ChatBubble>,
    );
    if (phase === "calculating") return entries;

    entries.push(
      <ChatBubble key="name-prompt" timestamp={times["name-prompt"]}>
        <h2 className="text-[15px] font-semibold text-[#111b21]">¿Cuál es tu nombre?</h2>
        {phase === "name" && !nameConfirmed ? (
          <form className="mt-3 flex flex-col gap-3" onSubmit={submitName}>
            <Input id="quiz-name" label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
            <Button type="submit" size="lg" className="w-full">
              Continuar
            </Button>
          </form>
        ) : null}
      </ChatBubble>,
    );
    if (phase === "name" && !nameConfirmed) return entries;

    entries.push(
      <ChatBubbleSent key="name-user" timestamp={times["name-user"]}>
        {name}
      </ChatBubbleSent>,
    );
    if (phase === "name") {
      entries.push(<ChatTyping key="typing-name" />);
      return entries;
    }

    entries.push(
      <ChatBubble key="email-prompt" timestamp={times["email-prompt"]}>
        <h2 className="text-[15px] font-semibold text-[#111b21]">¿A qué correo enviamos tu resultado?</h2>
        {phase === "email" && !emailConfirmed ? (
          <form className="mt-3 flex flex-col gap-3" onSubmit={submitEmail}>
            <Input
              id="quiz-email"
              type="email"
              label="Correo electrónico"
              placeholder="Ej: nombre@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error ?? undefined}
              required
            />
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Guardando..." : "Ver mi resultado"}
            </Button>
          </form>
        ) : null}
      </ChatBubble>,
    );
    if (phase === "email" && !emailConfirmed) return entries;

    entries.push(
      <ChatBubbleSent key="email-user" timestamp={times["email-user"]}>
        {email}
      </ChatBubbleSent>,
    );
    if (phase === "email") {
      entries.push(<ChatTyping key="typing-email" />);
      return entries;
    }

    entries.push(
      <ChatBubble key="done" timestamp={times["done"]}>
        <h2 className="text-[15px] font-semibold text-[#111b21]">¡Listo, {name}!</h2>
        <p className="mt-1 text-sm text-[#3b4a54]">Estamos preparando tu resultado personalizado.</p>
      </ChatBubble>,
    );

    return entries;
  }

  const progressPercent = phase === "question" && pendingIndex !== -1 ? Math.round(((pendingIndex + 1) / totalQuestions) * 100) : null;

  return (
    <WhatsAppScreen progress={progressPercent} contactName="Dr. Ricardo Morales" avatarSrc="/fotos/dr-ricardo-morales.jpg">
      {buildEntries()}
      <div ref={bottomRef} />
    </WhatsAppScreen>
  );
}
