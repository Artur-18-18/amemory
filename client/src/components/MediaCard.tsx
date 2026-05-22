import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaItem } from "../types";

interface MediaCardProps {
  item: MediaItem;
  index: number;
  paused?: boolean;
}

export function MediaCard({ item, index, paused = false }: MediaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });
  const parallaxX = useTransform(springX, [-0.5, 0.5], [-6, 6]);
  const parallaxY = useTransform(springY, [-0.5, 0.5], [-4, 4]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || item.type !== "video") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "80px", threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [item.type, item.url]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY]
  );

  const handlePointerLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.article
      ref={cardRef}
      className="group relative shrink-0 touch-manipulation"
      style={{ x: parallaxX, y: parallaxY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={[
          "glass-card relative overflow-hidden",
          "h-[clamp(120px,32vw,280px)] w-[clamp(160px,52vw,420px)]",
          "transition-shadow duration-500",
          "group-hover:shadow-glow-lg group-hover:border-luxury-glow/20",
          paused ? "" : "group-active:scale-[1.02] sm:group-hover:scale-[1.03]",
        ].join(" ")}
      >
        <div
          className={[
            "absolute inset-0 z-10 bg-gradient-to-t from-luxury-black/60 via-transparent to-transparent",
            "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          ].join(" ")}
        />

        {!loaded && (
          <div className="absolute inset-0 shimmer-bg animate-shimmer" aria-hidden />
        )}

        <motion.div
          className="relative h-full w-full overflow-hidden"
          whileHover={paused ? undefined : { scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {item.type === "image" ? (
            <img
              src={item.url}
              alt={item.filename}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              className={[
                "h-full w-full object-cover",
                "grayscale transition-all duration-700",
                "group-hover:grayscale-0 group-hover:brightness-110",
                loaded ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />
          ) : (
            <video
              ref={videoRef}
              src={item.url}
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedData={() => setLoaded(true)}
              className={[
                "h-full w-full object-cover",
                "grayscale transition-all duration-700",
                "group-hover:grayscale-0 group-hover:brightness-110",
                loaded ? "opacity-100" : "opacity-0",
              ].join(" ")}
              aria-label={item.filename}
            />
          )}
        </motion.div>

        <div
          className={[
            "pointer-events-none absolute inset-0 rounded-2xl",
            "ring-1 ring-inset ring-white/5",
            "transition-all duration-500",
            "group-hover:ring-luxury-glow/30",
            "group-hover:shadow-[inset_0_0_30px_rgba(167,139,250,0.08)]",
          ].join(" ")}
        />

        {item.type === "video" && (
          <span className="absolute bottom-3 right-3 z-20 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-luxury-silver backdrop-blur-md">
            Видео
          </span>
        )}
      </div>
    </motion.article>
  );
}
