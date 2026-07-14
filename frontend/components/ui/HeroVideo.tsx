"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

// TODO: pegar el ID (u URL) del video de YouTube del hero y pegarlo acá.
// Acepta tanto un ID puro (11 caracteres) como una URL completa de YouTube.
const HERO_YOUTUBE_VIDEO = "";

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLElement, options: Record<string, unknown>) => YouTubePlayer;
      PlayerState: { PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  unMute: () => void;
  mute: () => void;
  getPlayerState: () => number;
  destroy: () => void;
};

function extractYouTubeId(value: string): string | null {
  if (!value) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  const match = value.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

let youtubeApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return youtubeApiPromise;
}

export function HeroVideo({ video = HERO_YOUTUBE_VIDEO }: { video?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoId = extractYouTubeId(video);

  useEffect(() => {
    if (!videoId || !mountRef.current) return;
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !mountRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(mountRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 0,
          loop: 1,
          controls: 0,
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
          disablekb: 1,
          iv_load_policy: 3,
          playlist: videoId,
        },
        events: {
          onReady: (event: { target: YouTubePlayer }) => {
            event.target.unMute();
            event.target.playVideo();
          },
          onStateChange: (event: { data: number }) => {
            setIsPlaying(event.data === window.YT?.PlayerState.PLAYING);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId]);

  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player || !window.YT) return;
    if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  if (!videoId) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-900/95 p-6 text-center shadow-xl">
        <p className="text-sm font-semibold text-white">Video de YouTube pendiente</p>
        <p className="text-xs text-brand-200">Configurar HERO_YOUTUBE_VIDEO en HeroVideo.tsx</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-brand-900 shadow-2xl ring-1 ring-brand-900/10">
      <div ref={mountRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
        className="absolute inset-0 h-full w-full cursor-pointer"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" fill="currentColor" />
        ) : (
          <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
        )}
      </span>
    </div>
  );
}
