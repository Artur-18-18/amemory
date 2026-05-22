import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { fetchGallery } from "../api";
import { LikeButton } from "../components/LikeButton";
import { Lightbox } from "../components/Lightbox";
import { getSessionId } from "../utils/session";
import type { MediaItem } from "../types";

export function GalleryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<MediaItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchGallery(getSessionId());
      setItems(d.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateItem(filename: string, liked: boolean, likes: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.filename === filename ? { ...item, liked, likes } : item
      )
    );
    if (active?.filename === filename) {
      setActive((a) => (a ? { ...a, liked, likes } : null));
    }
  }

  const index = active ? items.findIndex((i) => i.id === active.id) : -1;

  return (
    <section className="py-20 sm:py-28 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-6">
        <motion.header
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs uppercase tracking-[0.35em] text-luxury-glow/80">Архив</p>
          <h1 className="font-display text-3xl font-light sm:text-4xl md:text-5xl">
            <span className="text-gradient-luxury italic">Галерея</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-luxury-silver">
            Нажмите на фото для просмотра. <span className="text-luxury-glow">♡</span> — поставить
            лайк (один раз с вашего устройства).
          </p>
        </motion.header>

        {loading && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] shimmer-bg animate-shimmer rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="glass-card p-10 text-center text-luxury-silver">
            Нет изображений. Добавьте фото в раздел «Витрина» через админ-панель.
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <button
                type="button"
                className="absolute inset-0 z-0"
                onClick={() => setActive(item)}
                aria-label={`Открыть ${item.title || item.filename}`}
              >
                <img
                  src={item.url}
                  alt={item.title || item.filename}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-110"
                />
              </button>

              <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                <div className="flex items-end justify-between gap-2">
                  <span className="min-w-0 truncate text-xs text-white/90">
                    {item.title}
                  </span>
                  <LikeButton
                    filename={item.filename}
                    likes={item.likes ?? 0}
                    liked={item.liked ?? false}
                    onUpdate={(liked, likes) => updateItem(item.filename, liked, likes)}
                    size="sm"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Lightbox
        item={active}
        onClose={() => setActive(null)}
        onLikeUpdate={
          active
            ? (liked, likes) => updateItem(active.filename, liked, likes)
            : undefined
        }
        onPrev={
          index > 0 ? () => setActive(items[index - 1]) : undefined
        }
        onNext={
          index < items.length - 1 ? () => setActive(items[index + 1]) : undefined
        }
      />
    </section>
  );
}
