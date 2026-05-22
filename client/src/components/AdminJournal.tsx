import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  createJournalEntry,
  deleteJournalEntry,
  fetchAdminJournal,
  updateJournalEntry,
} from "../api";
import type { JournalEntry } from "../types";

interface AdminJournalProps {
  token: string;
}

const emptyForm = { date: "", title: "", excerpt: "" };

export function AdminJournal({ token }: AdminJournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchAdminJournal(token);
    setEntries(data.entries);
  }, [token]);

  useEffect(() => {
    load().catch(() => setEntries([]));
  }, [load]);

  function startEdit(entry: JournalEntry) {
    setEditingId(entry.id);
    setForm({ date: entry.date, title: entry.title, excerpt: entry.excerpt });
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (editingId) {
        await updateJournalEntry(token, editingId, form);
        setMessage("Запись обновлена");
      } else {
        await createJournalEntry(token, form);
        setMessage("Запись добавлена");
      }
      cancelEdit();
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить запись журнала?")) return;
    await deleteJournalEntry(token, id);
    if (editingId === id) cancelEdit();
    await load();
    setMessage("Запись удалена");
  }

  return (
    <div className="glass-card mt-12 space-y-6 p-6 sm:p-8">
      <div>
        <h2 className="font-display text-xl">Журнал записей</h2>
        <p className="mt-1 text-sm text-luxury-silver">
          Редактируйте блок «Избранные записи» на главной странице
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-xs uppercase tracking-widest text-luxury-silver">
          Дата
          <input
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
            placeholder="Май 2026"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-luxury-glow/50"
          />
        </label>
        <label className="block text-xs uppercase tracking-widest text-luxury-silver">
          Заголовок
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-luxury-glow/50"
          />
        </label>
        <label className="block text-xs uppercase tracking-widest text-luxury-silver">
          Текст
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-luxury-glow/50"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-white px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-luxury-black disabled:opacity-50"
          >
            {saving ? "Сохранение…" : editingId ? "Сохранить" : "Добавить запись"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-full border border-white/10 px-6 py-2.5 text-xs uppercase tracking-widest"
            >
              Отмена
            </button>
          )}
        </div>
        {message && <p className="text-sm text-luxury-glow">{message}</p>}
      </form>

      <ul className="divide-y divide-white/[0.06]">
        {entries.map((entry) => (
          <li key={entry.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-luxury-silver">{entry.date}</p>
              <p className="mt-1 text-sm font-medium text-white">{entry.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-luxury-silver">{entry.excerpt}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => startEdit(entry)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider hover:border-luxury-glow/40"
              >
                Изменить
              </button>
              <button
                type="button"
                onClick={() => handleDelete(entry.id)}
                className="rounded-full border border-red-500/30 px-3 py-1 text-xs uppercase tracking-wider text-red-300"
              >
                Удалить
              </button>
            </div>
          </li>
        ))}
        {entries.length === 0 && (
          <li className="py-4 text-sm text-luxury-silver">Нет записей — добавьте первую выше</li>
        )}
      </ul>
    </div>
  );
}
