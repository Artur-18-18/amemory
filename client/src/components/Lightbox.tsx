import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { LikeButton } from "./LikeButton";
import type { MediaItem } from "../types";

interface LightboxProps {
  item: MediaItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onLikeUpdate?: (liked: boolean, likes: number) => void;
  index?: number;
  total?: number;
}

const SWIPE_OFFSET = 60;
const SWIPE_VELOCITY = 400;

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : dir < 0 ? "-100%" : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : dir < 0 ? "100%" : 0,
    opacity: 0,
  }),
};

export function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
  onLikeUpdate,
  index = 0,
  total = 1,
}: LightboxProps) {
  const [direction, setDirection] = useState(0);

  const goNext = useCallback(() => {
    if (!onNext) return;
    setDirection(1);
    onNext();
  }, [onNext]);

  const goPrev = useCallback(() => {
    if (!onPrev) return;
    setDirection(-1);
    onPrev();
  }, [onPrev]);

  useEffect(() => {
    if (!item) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose, goNext, goPrev]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_OFFSET || info.velocity.x < -SWIPE_VELOCITY) {
      goNext();
      return;
    }
    if (info.offset.x > SWIPE_OFFSET || info.velocity.x > SWIPE_VELOCITY) {
      goPrev();
    }
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[100] flex touch-pan-y items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs uppercase tracking-widest backdrop-blur-md"
            onClick={onClose}
          >
            Закрыть
          </button>

          {total > 1 && (
            <p className="absolute left-4 top-4 z-20 text-xs uppercase tracking-widest text-luxury-silver">
              {index + 1} / {total}
            </p>
          )}

          {onPrev && (
            <button
              type="button"
              className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-4 py-3 text-lg backdrop-blur-md transition hover:border-luxury-glow/40 sm:block sm:left-4"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Предыдущее"
            >
              ←
            </button>
          )}

          {onNext && (
            <button
              type="button"
              className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-4 py-3 text-lg backdrop-blur-md transition hover:border-luxury-glow/40 sm:block sm:right-4"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Следующее"
            >
              →
            </button>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={item.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              className="relative z-10 max-h-[85vh] w-full max-w-5xl cursor-grab touch-pan-y active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              {item.type === "image" && (
                <img
                  src={item.url}
                  alt={item.title || item.filename}
                  draggable={false}
                  className="mx-auto max-h-[75vh] w-auto select-none object-contain"
                />
              )}
              {item.type === "video" && (
                <video
                  key={item.url}
                  src={item.url}
                  controls
                  autoPlay
                  playsInline
                  className="mx-auto max-h-[75vh] w-full select-none"
                />
              )}
              {item.type === "audio" && (
                <div className="glass-card mx-auto min-w-[280px] max-w-md p-8">
                  <audio src={item.url} controls autoPlay className="w-full" />
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 px-4 pb-2">
                <p className="text-sm text-luxury-silver">{item.title || item.filename}</p>
                {(item.type === "image" || item.type === "video") && onLikeUpdate && (
                  <LikeButton
                    filename={item.filename}
                    likes={item.likes ?? 0}
                    liked={item.liked ?? false}
                    onUpdate={onLikeUpdate}
                  />
                )}
              </div>

              {total > 1 && (
                <p className="pb-2 text-center text-[10px] uppercase tracking-[0.25em] text-luxury-silver/70 sm:hidden">
                  Свайп ← → для переключения
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
