"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export function HeroVideo({
  src = "/videos/movilidad-total/vsl.mp4",
  poster = "/videos/movilidad-total/vsl-poster.jpg",
}: {
  src?: string;
  poster?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Forzado sin fallback a silenciado — solo para probar si el navegador
    // deja reproducir con sonido automáticamente.
    video.muted = false;
    video.play().catch((error) => {
      console.log("Autoplay con sonido bloqueado por el navegador.", error);
    });
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-brand-900/10">
      <video
        ref={videoRef}
        className="h-full w-full cursor-pointer bg-brand-900 object-cover"
        src={src}
        poster={poster}
        playsInline
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlayback}
      />
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
        className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" fill="currentColor" />
        ) : (
          <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
        )}
      </button>
    </div>
  );
}
