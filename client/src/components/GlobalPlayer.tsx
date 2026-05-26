import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { mediaDownloadUrl } from "../api";
import { usePlayer } from "../context/PlayerContext";

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GlobalPlayer() {
  const {
    queue,
    source,
    sourceLabel,
    currentIndex,
    playing,
    progress,
    duration,
    hasQueue,
    togglePlay,
    next,
    prev,
    seek,
  } = usePlayer();

  const track = queue[currentIndex];

  return (
    <AnimatePresence>
      {hasQueue && track && (
        <motion.div
          className="player-bar fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.08] bg-luxury-matte/95 backdrop-blur-2xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="region"
          aria-label="Фоновый плеер"
        >
          <div className="mx-auto max-w-6xl px-3 py-2.5 sm:px-6 sm:py-3">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="mb-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-luxury-glow sm:mb-3"
              aria-label="Прогресс трека"
            />

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={prev}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sm transition hover:border-luxury-glow/40 sm:h-10 sm:w-10"
                  aria-label="Предыдущий трек"
                >
                  ⏮
                </button>
                <motion.button
                  type="button"
                  onClick={togglePlay}
                  whileTap={{ scale: 0.92 }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-base text-luxury-black shadow-glow sm:h-12 sm:w-12"
                  aria-label={playing ? "Пауза" : "Воспроизвести"}
                >
                  {playing ? "❚❚" : "▶"}
                </motion.button>
                <button
                  type="button"
                  onClick={next}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sm transition hover:border-luxury-glow/40 sm:h-10 sm:w-10"
                  aria-label="Следующий трек"
                >
                  ⏭
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white sm:text-base">
                  {track.title || "Без названия"}
                </p>
                <p className="truncate text-[10px] uppercase tracking-widest text-luxury-silver sm:text-xs">
                  {sourceLabel}
                  <span className="mx-1.5 text-white/20">·</span>
                  {formatTime(progress)} / {formatTime(duration)}
                  <span className="mx-1.5 hidden text-white/20 sm:inline">·</span>
                  <span className="hidden sm:inline">
                    {currentIndex + 1} / {queue.length}
                  </span>
                </p>
              </div>

              <div className="hidden shrink-0 items-center gap-2 md:flex">
                <a
                  href={mediaDownloadUrl(track.url)}
                  download={track.filename}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sm text-luxury-silver transition hover:border-luxury-glow/40 hover:text-luxury-glow"
                  title="Скачать трек"
                  aria-label="Скачать трек"
                >
                  ↓
                </a>
                {source !== "music" && (
                  <Link
                    to="/music"
                    className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-widest transition hover:border-luxury-glow/40"
                  >
                    Музыка
                  </Link>
                )}
                {source !== "playlist" && (
                  <Link
                    to="/playlist"
                    className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-widest transition hover:border-luxury-glow/40"
                  >
                    Плейлист
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-2 flex gap-2 md:hidden">
              <a
                href={mediaDownloadUrl(track.url)}
                download={track.filename}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-sm text-luxury-silver"
                title="Скачать"
                aria-label="Скачать трек"
              >
                ↓
              </a>
              {source !== "music" && (
                <Link
                  to="/music"
                  className="flex-1 rounded-full border border-white/10 py-1.5 text-center text-[10px] uppercase tracking-widest"
                >
                  Музыка
                </Link>
              )}
              {source !== "playlist" && (
                <Link
                  to="/playlist"
                  className="flex-1 rounded-full border border-white/10 py-1.5 text-center text-[10px] uppercase tracking-widest"
                >
                  Плейлист
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
