"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

// Patrón de fondo tipo "doodle" del wallpaper clásico de WhatsApp — un SVG
// inline en vez de una imagen externa (sin depender de ningún asset, sin
// problemas de licencia). Trazos sutiles sobre el tono beige de fondo.
const WALLPAPER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
  <g fill="none" stroke="#00000012" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="14" y="26" width="26" height="19" rx="3"/>
    <circle cx="27" cy="36" r="6.5"/>
    <path d="M92 14v22a5.5 5.5 0 1 1-3-4.9V14h9"/>
    <path d="M150 22h17v15a8.5 8.5 0 0 1-17 0z"/>
    <path d="M167 27h4a4 4 0 0 1 0 8h-4"/>
    <rect x="12" y="92" width="28" height="19"/>
    <path d="M12 92l14 11 14-11"/>
    <circle cx="100" cy="100" r="13"/>
    <path d="M100 91l4.5 13-9.5-4z"/>
    <circle cx="172" cy="100" r="9"/>
    <circle cx="172" cy="100" r="3"/>
    <path d="M172 91V64"/>
    <circle cx="42" cy="168" r="13"/>
    <path d="M42 160v8l6 4"/>
    <path d="M104 156q9-11 18 0-9 11-18 0z"/>
    <path d="M158 154l32 11-13 4-4 13z"/>
    <path d="M18 190h20M64 190a6 6 0 0 1 12 0"/>
  </g>
</svg>`;

const WALLPAPER_BG = `url("data:image/svg+xml,${encodeURIComponent(WALLPAPER_SVG)}")`;

// Simula la interfaz de una conversación de WhatsApp — pensado para
// reutilizarse en cualquier flujo que quiera esa estética (quiz, futuras
// pantallas de resultado, etc). En mobile ocupa toda la pantalla, como una
// app real; en desktop queda centrado como si fuera un teléfono.
export function WhatsAppScreen({
  children,
  onBack,
  progress,
  contactName,
  contactStatus = "en línea",
  avatarSrc,
}: {
  children: ReactNode;
  onBack?: () => void;
  progress?: number | null;
  contactName?: string;
  contactStatus?: string;
  avatarSrc?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b141a] sm:p-6">
      <div className="flex h-screen w-full max-w-md flex-col overflow-hidden bg-[#e5ddd5] sm:h-[calc(100vh-3rem)] sm:rounded-2xl sm:shadow-2xl">
        <header className="flex h-14 shrink-0 items-center gap-1 bg-[#075e54] px-1">
          <button
            type="button"
            onClick={onBack ?? (() => {})}
            aria-label="Volver"
            className="shrink-0 rounded-full p-2 text-white transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt={contactName ?? ""} className="h-9 w-9 shrink-0 rounded-full object-cover" />
          ) : null}
          {contactName ? (
            <div className="ml-1 flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[15px] font-medium text-white">{contactName}</span>
              {contactStatus ? <span className="text-[12.5px] text-white/80">{contactStatus}</span> : null}
            </div>
          ) : null}
        </header>
        {/* Fuera del área con scroll a propósito: así nunca se esconde
            cuando se desplaza la conversación. */}
        {progress != null ? (
          <div className="shrink-0 bg-[#e5ddd5] px-3 pb-2 pt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
              <div className="h-full rounded-full bg-[#25d366] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}
        <div className="flex-1 overflow-y-auto px-3 py-4" style={{ backgroundImage: WALLPAPER_BG, backgroundSize: "220px 220px" }}>
          <div className="mx-auto flex max-w-md flex-col gap-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Burbuja de mensaje recibido (blanca, alineada a la izquierda). La "colita"
// es un triángulo recortado con clip-path pegado a la esquina superior
// izquierda, como en WhatsApp real.
export function ChatBubble({ children, timestamp }: { children: ReactNode; timestamp?: string }) {
  return (
    <div className="relative max-w-[88%] animate-fade-up rounded-lg bg-white px-3 py-2 shadow-sm [animation-duration:0.4s]">
      <span
        aria-hidden="true"
        className="absolute -left-2 top-0 h-3 w-3 bg-white"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
      />
      {children}
      {/* Sin el doble check: ese ícono es un recibo de lectura, solo tiene
          sentido en mensajes enviados por el usuario (ver ChatBubbleSent). */}
      {timestamp ? <span className="mt-1 block text-right text-[11px] text-[#667781]">{timestamp}</span> : null}
    </div>
  );
}

// Burbuja de mensaje enviado (verde, alineada a la derecha) — se usa para
// mostrar la respuesta del usuario como si él mismo la hubiera mandado.
// Estándar del flujo: toda selección/typeo del usuario se refleja acá.
export function ChatBubbleSent({ children, timestamp }: { children: ReactNode; timestamp?: string }) {
  return (
    <div className="relative ml-auto max-w-[88%] animate-fade-up rounded-lg bg-[#dcf8c6] px-3 py-2 shadow-sm [animation-duration:0.4s]">
      <span
        aria-hidden="true"
        className="absolute -right-2 top-0 h-3 w-3 bg-[#dcf8c6]"
        style={{ clipPath: "polygon(0 0, 0 100%, 100% 0)" }}
      />
      {children}
      {timestamp ? (
        <span className="mt-1 flex items-center justify-end gap-1 text-[11px] text-[#667781]">
          {timestamp}
          <span className="text-[#53bdeb]" style={{ letterSpacing: "-3px", marginRight: "2px" }}>
            ✓✓
          </span>
        </span>
      ) : null}
    </div>
  );
}

// Indicador de "escribiendo..." — se muestra mientras se retrasa a propósito
// la revelación del próximo mensaje del bot, para que no aparezcan dos
// mensajes juntos de una.
export function ChatTyping() {
  return (
    <div className="relative flex w-fit animate-fade-up items-center gap-1 rounded-lg bg-white px-3.5 py-3 shadow-sm [animation-duration:0.3s]">
      <span
        aria-hidden="true"
        className="absolute -left-2 top-0 h-3 w-3 bg-white"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
      />
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8696a0]"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
