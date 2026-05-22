import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchJournal } from "../api";
import type { JournalEntry } from "../types";

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJournal()
      .then((d) => setEntries(d.entries))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="journal" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-luxury-glow/80">Журнал</p>
          <h2 className="font-display text-3xl font-light sm:text-4xl">Избранные записи</h2>
        </motion.div>

        {loading && (
          <div className="mt-12 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 shimmer-bg animate-shimmer rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <p className="mt-12 text-center text-sm text-luxury-silver">
            Записей пока нет. Добавьте их в админ-панели.
          </p>
        )}

        <ul className="mt-12 space-y-0 divide-y divide-white/[0.06]">
          {entries.map((entry, i) => (
            <motion.li
              key={entry.id}
              className="group py-8"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <p className="text-xs uppercase tracking-widest text-luxury-silver">{entry.date}</p>
              <h3 className="mt-2 font-display text-2xl font-light transition group-hover:text-luxury-glow">
                {entry.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-luxury-silver">{entry.excerpt}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
