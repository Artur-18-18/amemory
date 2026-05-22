export function ShowcaseSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading gallery">
      {[0, 1].map((row) => (
        <div key={row} className="marquee-mask flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="glass-card h-[clamp(120px,32vw,280px)] w-[clamp(160px,52vw,420px)] shrink-0 shimmer-bg animate-shimmer"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
