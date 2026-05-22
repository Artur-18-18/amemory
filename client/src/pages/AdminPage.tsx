import { motion } from "framer-motion";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  clearAdminVisits,
  deleteAdminFile,
  fetchAdminFiles,
  fetchAdminVisits,
  loginAdmin,
  renameAdminFile,
  uploadAdminFile,
} from "../api";
import { AdminJournal } from "../components/AdminJournal";
import { PasswordGate } from "../components/PasswordGate";
import { VisitHistory } from "../components/VisitHistory";
import type { AdminFilesResponse, MediaItem, VisitRecord, VisitStats } from "../types";

const TOKEN_KEY = "amemory_admin_token";

const CATEGORIES = [
  {
    id: "showcase",
    label: "Витрина",
    hint: "Фото и видео на главной (бегущие строки + галерея)",
    accept: "image/*,video/*",
  },
  {
    id: "music",
    label: "Музыка",
    hint: "Треки для раздела «Музыка»",
    accept: "audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac,.mpeg",
  },
  {
    id: "playlist",
    label: "Плейлист",
    hint: "Треки напрямую в плейлист ИЛИ через ★ в разделе «Музыка» на сайте",
    accept: "audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac,.mpeg",
  },
  {
    id: "memories",
    label: "Воспоминания",
    hint: "Закрытый раздел (фото, видео, аудио)",
    accept: "image/*,video/*,audio/*",
  },
] as const;

export function AdminPage() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [files, setFiles] = useState<AdminFilesResponse | null>(null);
  const [category, setCategory] = useState<string>("showcase");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [visitStats, setVisitStats] = useState<VisitStats>({
    total: 0,
    uniqueSessions: 0,
    byDevice: [],
  });

  const loadVisits = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchAdminVisits(token);
      setVisits(data.visits);
      setVisitStats(data.stats);
    } catch {
      /* ignore */
    }
  }, [token]);

  const loadFiles = useCallback(async () => {
    if (!token) return;
    try {
      setFiles(await fetchAdminFiles(token));
    } catch {
      sessionStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }
  }, [token]);

  useEffect(() => {
    loadFiles();
    loadVisits();
  }, [loadFiles, loadVisits]);

  async function handleLogin(password: string) {
    const { token: t } = await loginAdmin(password);
    sessionStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setFiles(null);
  }

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      await uploadAdminFile(token, file, category, title || undefined);
      setMessage(`Загружено в «${CATEGORIES.find((c) => c.id === category)?.label}»`);
      setTitle("");
      form.reset();
      await loadFiles();
      if (category === "music" || category === "playlist") {
        window.dispatchEvent(new Event("amemory-library-refresh"));
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(cat: string, filename: string) {
    if (!token || !confirm("Удалить файл?")) return;
    await deleteAdminFile(token, cat, filename);
    await loadFiles();
  }

  async function handleClearVisits() {
    if (!token || !confirm("Очистить всю историю визитов?")) return;
    await clearAdminVisits(token);
    await loadVisits();
  }

  async function handleRename(item: MediaItem) {
    if (!token) return;
    const newTitle = prompt("Название:", item.title);
    if (!newTitle || !item.category) return;
    await renameAdminFile(token, item.category, item.filename, newTitle);
    await loadFiles();
  }

  if (!token) {
    return (
      <section className="py-24">
        <PasswordGate
          title="Админ-панель"
          subtitle="Управление контентом сайта — загрузка и удаление файлов."
          onSubmit={handleLogin}
        />
      </section>
    );
  }

  const catInfo = CATEGORIES.find((c) => c.id === category)!;

  return (
    <section className="py-20 sm:py-28 md:py-32">
      <div className="mx-auto w-full max-w-4xl px-3 sm:px-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-luxury-glow/80">Управление</p>
            <h1 className="font-display text-3xl font-light">Админ-панель</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-xs uppercase tracking-widest text-luxury-silver hover:text-white"
          >
            Выйти
          </button>
        </div>

        <motion.form
          onSubmit={handleUpload}
          className="glass-card space-y-4 p-6 sm:p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-display text-xl">Загрузить файл</h2>

          <label className="block text-xs uppercase tracking-widest text-luxury-silver">
            Раздел
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-luxury-silver/80">{catInfo.hint}</p>

          <label className="block text-xs uppercase tracking-widest text-luxury-silver">
            Название (необязательно)
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
              placeholder="Название трека или работы"
            />
          </label>

          <input
            name="file"
            type="file"
            accept={catInfo.accept}
            required
            className="block w-full text-sm text-luxury-silver file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:uppercase file:text-luxury-black"
          />

          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-full bg-white py-3 text-xs font-medium uppercase tracking-[0.2em] text-luxury-black disabled:opacity-50"
          >
            {uploading ? "Загрузка…" : "Загрузить"}
          </button>
          {message && <p className="text-center text-sm text-luxury-glow">{message}</p>}
        </motion.form>

        {token && <AdminJournal token={token} />}

        <VisitHistory
          visits={visits}
          stats={visitStats}
          onClear={handleClearVisits}
          onRefresh={loadVisits}
        />

        <div className="mt-12 space-y-8">
          {CATEGORIES.map((cat) => {
            const list = files?.[cat.id as keyof AdminFilesResponse] ?? [];
            return (
              <div key={cat.id} className="glass-card p-6">
                <h3 className="font-display text-xl">
                  {cat.label}{" "}
                  <span className="text-sm text-luxury-silver">({list.length})</span>
                </h3>
                {list.length === 0 ? (
                  <p className="mt-3 text-sm text-luxury-silver">Пусто</p>
                ) : (
                  <ul className="mt-4 divide-y divide-white/[0.06]">
                    {list.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-3"
                      >
                        <div>
                          <p className="text-sm text-white">{item.title}</p>
                          <p className="text-xs text-luxury-silver">{item.filename}</p>
                          {cat.id === "showcase" &&
                            (item.type === "image" || item.type === "video") && (
                            <p className="mt-1 text-xs text-red-300/90">
                              ♥ {item.likes ?? 0}{" "}
                              {(item.likes ?? 0) === 1
                                ? "лайк"
                                : (item.likes ?? 0) >= 2 && (item.likes ?? 0) <= 4
                                  ? "лайка"
                                  : "лайков"}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleRename(item)}
                            className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider hover:border-luxury-glow/40"
                          >
                            Переименовать
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id, item.filename)}
                            className="rounded-full border border-red-500/30 px-3 py-1 text-xs uppercase tracking-wider text-red-300 hover:bg-red-500/10"
                          >
                            Удалить
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
