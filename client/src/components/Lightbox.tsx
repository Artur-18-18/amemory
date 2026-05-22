import { AnimatePresence, motion } from "framer-motion";
import { LikeButton } from "./LikeButton";
import type { MediaItem } from "../types";

interface LightboxProps {
  item: MediaItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onLikeUpdate?: (liked: boolean, likes: number) => void;
}

export function Lightbox({ item, onClose, onPrev, onNext, onLikeUpdate }: LightboxProps) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-widest"
            onClick={onClose}
          >
            Закрыть
          </button>

          {onPrev && (
            <button
              type="button"
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 px-3 py-2 sm:left-4"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
            >
              ←
            </button>
          )}

          {onNext && (
            <button
              type="button"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 px-3 py-2 sm:right-4"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            >
              →
            </button>
          )}

          <motion.div
            className="max-h-[85vh] max-w-5xl overflow-hidden rounded-2xl"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            {item.type === "image" && (
              <img
                src={item.url}
                alt={item.title || item.filename}
                className="max-h-[85vh] w-auto object-contain"
              />
            )}
            {item.type === "video" && (
              <video src={item.url} controls autoPlay className="max-h-[85vh] w-full" />
            )}
            {item.type === "audio" && (
              <div className="glass-card min-w-[280px] p-8 sm:min-w-[320px]">
                <audio src={item.url} controls autoPlay className="w-full" />
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 px-4 pb-2">
              <p className="text-sm text-luxury-silver">{item.title || item.filename}</p>
              {item.type === "image" && onLikeUpdate && (
                <LikeButton
                  filename={item.filename}
                  likes={item.likes ?? 0}
                  liked={item.liked ?? false}
                  onUpdate={onLikeUpdate}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
