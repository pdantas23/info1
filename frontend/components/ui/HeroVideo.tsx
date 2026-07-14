"use client";

import ReactDOM from "react-dom";
import Script from "next/script";
import { VTURB_ACCOUNT_ID, VTURB_VIDEO_ID } from "@/lib/vturb/config";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- augmentar JSX.IntrinsicElements exige `namespace`
  namespace JSX {
    interface IntrinsicElements {
      "vturb-smartplayer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

const playerId = `vid-${VTURB_VIDEO_ID}`;
const playerSrc = `https://scripts.converteai.net/${VTURB_ACCOUNT_ID}/players/${VTURB_VIDEO_ID}/v4/player.js`;
const smartplayerSdkSrc = "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js";
const hlsSrc = `https://cdn.converteai.net/${VTURB_ACCOUNT_ID}/${VTURB_VIDEO_ID}/main.m3u8`;

export function HeroVideo() {
  ReactDOM.preload(playerSrc, { as: "script" });
  ReactDOM.preload(smartplayerSdkSrc, { as: "script" });
  ReactDOM.preload(hlsSrc, { as: "fetch" });
  ReactDOM.prefetchDNS("https://cdn.converteai.net");
  ReactDOM.prefetchDNS("https://scripts.converteai.net");
  ReactDOM.prefetchDNS("https://images.converteai.net");
  ReactDOM.prefetchDNS("https://license.vturb.com");

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-brand-900 shadow-2xl ring-1 ring-brand-900/10">
      <vturb-smartplayer id={playerId} style={{ display: "block", margin: "0 auto", width: "100%" }}>
        <div
          className="vturb-player-placeholder"
          style={{ position: "relative", width: "100%", padding: "56.25% 0 0", zIndex: 0, backgroundColor: "black" }}
        />
      </vturb-smartplayer>
      <Script id={`${playerId}-loader`} strategy="afterInteractive">
        {`
          !function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);
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
