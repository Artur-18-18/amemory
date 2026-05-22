import type { MediaItem } from "../types";
import { LikeButton } from "./LikeButton";

interface GalleryTileProps {
  item: MediaItem;
  onOpen: () => void;
  onLikeUpdate: (liked: boolean, likes: number) => void;
}

export function GalleryTile({ item, onOpen, onLikeUpdate }: GalleryTileProps) {
  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
      <button
        type="button"
        className="absolute inset-0 z-0"
        onClick={onOpen}
        aria-label={`Открыть ${item.title || item.filename}`}
      >
        {item.type === "image" ? (
          <img
            src={item.url}
            alt={item.title || item.filename}
            loading="lazy"
            className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-110"
          />
        ) : (
          <>
            <video
              src={item.url}
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-110"
              onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
              onTouchStart={(e) => e.currentTarget.play().catch(() => {})}
            />
            <span className="pointer-events-none absolute left-2 top-2 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white backdrop-blur-sm">
              Видео
            </span>
          </>
        )}
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
        <div className="flex items-end justify-between gap-2">
          <span className="min-w-0 truncate text-xs text-white/90">{item.title}</span>
          <LikeButton
            filename={item.filename}
            likes={item.likes ?? 0}
            liked={item.liked ?? false}
            onUpdate={onLikeUpdate}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
