export function StarRating({ rating = 5, className = "h-5 w-5" }: { rating?: number; className?: string }) {
  return (
    <div className="flex items-center gap-0.5 text-accent-500" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.79L10 14.9l-5.21 2.61 1-5.79-4.21-4.1 5.82-.85z" />
        </svg>
      ))}
    </div>
  );
}
