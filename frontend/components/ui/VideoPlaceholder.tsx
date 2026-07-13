export function VideoPlaceholder({ expectedPath = "/videos/movilidad-total/vsl.mp4" }: { expectedPath?: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-900/95 p-6 text-center shadow-xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-500">
        <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-7 w-7">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-white">Video de ventas (VSL)</p>
      <p className="text-xs text-brand-200">{expectedPath}</p>
    </div>
  );
}
