import { useState } from "react";
import { usePlayer, type QueueSource } from "../context/PlayerContext";
import type { MediaItem } from "../types";

interface TrackListProps {
  tracks: MediaItem[];
  source: QueueSource;
  sourceLabel: string;
  emptyText?: string;
  showFavorites?: boolean;
}

export function TrackList({
  tracks,
  source,
  sourceLabel,
  emptyText = "Пока нет треков. Загрузите MP3/WAV в админке → раздел «Музыка».",
  showFavorites = false,
}: TrackListProps) {
  const {
    queue,
    source: activeSource,
    currentIndex,
    playing,
    setQueue,
    playIndex,
    toggleFavorite,
    isFavorite,
  } = usePlayer();

  const [favLoading, setFavLoading] = useState<string | null>(null);

  const isActiveQueue = activeSource === source && queue.length > 0;

  if (tracks.length === 0) {
    return (
      <div className="glass-card space-y-3 p-6 text-center text-sm text-luxury-silver sm:p-8">
        <p>{emptyText}</p>
        {showFavorites && (
          <p className="text-xs text-luxury-glow/80">
            Сначала загрузите трек в «Музыка», затем нажмите ★ — он появится в плейлисте.
          </p>
        )}
      </div>
    );
  }

  async function handleFavorite(e: React.MouseEvent, filename: string) {
    e.stopPropagation();
    setFavLoading(filename);
    try {
      await toggleFavorite(filename);
    } finally {
      setFavLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {showFavorites && (
        <p className="text-center text-xs text-luxury-silver">
          Нажмите <span className="text-luxury-glow">★</span> — трек автоматически добавится в
          плейлист
        </p>
      )}

      <button
        type="button"
        onClick={() => setQueue(tracks, source, sourceLabel, 0)}
        className="w-full rounded-full border border-luxury-glow/30 bg-luxury-glow/10 py-3 text-xs uppercase tracking-[0.2em] text-white transition hover:border-luxury-glow/50 hover:shadow-glow"
      >
        ▶ Воспроизвести всё
      </button>

      <ul className="space-y-2">
        {tracks.map((t, i) => {
          const isCurrent = isActiveQueue && i === currentIndex;
          const fav = isFavorite(t.filename);
          return (
            <li key={t.id}>
              <div
                className={[
                  "glass-card flex w-full items-center gap-2 px-2 py-2 transition sm:gap-3 sm:px-3 sm:py-3",
                  isCurrent ? "border-luxury-glow/30 shadow-glow" : "hover:border-white/20",
                ].join(" ")}
              >
                {showFavorites && (
                  <button
                    type="button"
                    onClick={(e) => handleFavorite(e, t.filename)}
                    disabled={favLoading === t.filename}
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg transition",
                      fav
                        ? "border-luxury-glow/50 bg-luxury-glow/20 text-luxury-glow"
                        : "border-white/10 text-luxury-silver hover:border-luxury-glow/40 hover:text-luxury-glow",
                    ].join(" ")}
                    title={fav ? "Убрать из плейлиста" : "В избранное → плейлист"}
                    aria-label={fav ? "Убрать из избранного" : "Добавить в избранное"}
                  >
                    {favLoading === t.filename ? "…" : fav ? "★" : "☆"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (isActiveQueue) playIndex(i);
                    else setQueue(tracks, source, sourceLabel, i);
                  }}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                >
                  <span className="truncate text-sm text-white">{t.title}</span>
                  <span className="shrink-0 text-xs text-luxury-silver">
                    {isCurrent && playing ? "▶ Играет" : isCurrent ? "Пауза" : fav && showFavorites ? "В плейлисте" : ""}
                  </span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
