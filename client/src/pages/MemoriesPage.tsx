import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchMemories, loginMemories } from "../api";
import { Lightbox } from "../components/Lightbox";
import { PasswordGate } from "../components/PasswordGate";
import type { MediaItem } from "../types";

const TOKEN_KEY = "amemory_memories_token";

export function MemoriesPage() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchMemories(token)
      .then((d) => setItems(d.items))
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleLogin(password: string) {
    const { token: t } = await loginMemories(password);
    sessionStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setItems([]);
  }

  if (!token) {
    return (
      <section className="py-24">
        <PasswordGate
          title="Воспоминания"
          subtitle="Личный архив, доступный только по паролю."
          onSubmit={handleLogin}
        />
      </section>
    );
  }

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs uppercase tracking-[0.35em] text-luxury-glow/80">Личное</p>
            <h1 className="font-display text-4xl font-light">
              <span className="text-gradient-luxury italic">Воспоминания</span>
            </h1>
          </motion.header>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-widest transition hover:border-red-400/40"
          >
            Выйти
          </button>
        </div>

        {loading && <div className="glass-card h-40 shimmer-bg animate-shimmer" />}

        {!loading && items.length === 0 && (
          <div className="glass-card p-10 text-center text-luxury-silver">
            Пока пусто. Загрузите файлы в раздел «Воспоминания» через админ-панель.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item)}
              className="glass-card group overflow-hidden text-left"
            >
              {item.type === "image" && (
                <img
                  src={item.url}
                  alt={item.title}
                  className="aspect-video w-full object-cover grayscale transition group-hover:grayscale-0"
                />
              )}
              {item.type === "video" && (
                <video
                  src={item.url}
                  muted
                  className="aspect-video w-full object-cover"
                />
              )}
              {item.type === "audio" && (
                <div className="flex aspect-video items-center justify-center bg-black/40 text-4xl">
                  ♪
                </div>
              )}
              <p className="p-4 text-sm text-white">{item.title}</p>
            </button>
          ))}
        </div>
      </div>

      <Lightbox
        item={active}
        index={active ? items.findIndex((i) => i.id === active.id) : 0}
        total={items.length}
        onClose={() => setActive(null)}
        onPrev={
          active && items.findIndex((i) => i.id === active.id) > 0
            ? () => {
                const i = items.findIndex((x) => x.id === active.id);
                setActive(items[i - 1]);
              }
            : undefined
        }
        onNext={
          active && items.findIndex((i) => i.id === active.id) < items.length - 1
            ? () => {
                const i = items.findIndex((x) => x.id === active.id);
                setActive(items[i + 1]);
              }
            : undefined
        }
      />
    </section>
  );
}
