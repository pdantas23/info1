"use client";

import Script from "next/script";

// TODO: pegar acá los datos reales del video en VTurb (te los paso yo).
// ACCOUNT_ID es el UUID de la cuenta (aparece en la URL del embed que te
// da VTurb: scripts.converterai.net/<ACCOUNT_ID>/players/<VIDEO_ID>/v4/player.js).
const VTURB_ACCOUNT_ID = "";
const VTURB_VIDEO_ID = "";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "vturb-smartplayer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export function HeroVideo() {
  if (!VTURB_ACCOUNT_ID || !VTURB_VIDEO_ID) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-900/95 p-6 text-center shadow-xl">
        <p className="text-sm font-semibold text-white">Video de VTurb pendiente</p>
        <p className="text-xs text-brand-200">Configurar VTURB_ACCOUNT_ID y VTURB_VIDEO_ID en HeroVideo.tsx</p>
      </div>
    );
  }

  const playerId = `vid-${VTURB_VIDEO_ID}`;
  const playerSrc = `https://scripts.converterai.net/${VTURB_ACCOUNT_ID}/players/${VTURB_VIDEO_ID}/v4/player.js`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-brand-900 shadow-2xl ring-1 ring-brand-900/10">
      <vturb-smartplayer id={playerId} style={{ display: "block", margin: "0 auto", width: "100%" }} />
      <Script id={`${playerId}-loader`} strategy="afterInteractive">
        {`
          (function() {
            if (document.querySelector('script[src="${playerSrc}"]')) return;
            var s = document.createElement("script");
            s.src = "${playerSrc}";
            s.async = true;
            document.head.appendChild(s);
          })();
        `}
      </Script>
    </div>
  );
}
