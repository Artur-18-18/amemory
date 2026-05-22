import { motion } from "framer-motion";
import type { VisitRecord, VisitStats } from "../types";

interface VisitHistoryProps {
  visits: VisitRecord[];
  stats: VisitStats;
  onClear: () => void;
  onRefresh: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function deviceIcon(type: string) {
  if (type === "Телефон") return "📱";
  if (type === "Планшет") return "📲";
  return "💻";
}

export function VisitHistory({ visits, stats, onClear, onRefresh }: VisitHistoryProps) {
  return (
    <div className="glass-card mt-12 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl">История устройств</h2>
          <p className="mt-1 text-sm text-luxury-silver">
            Кто и с какого устройства открывал сайт
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-white/10 px-4 py-1.5 text-xs uppercase tracking-widest hover:border-luxury-glow/40"
          >
            Обновить
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-red-500/30 px-4 py-1.5 text-xs uppercase tracking-widest text-red-300 hover:bg-red-500/10"
          >
            Очистить
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
          <p className="text-xs uppercase tracking-widest text-luxury-silver">Всего визитов</p>
          <p className="mt-1 font-display text-2xl text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
          <p className="text-xs uppercase tracking-widest text-luxury-silver">Сессий</p>
          <p className="mt-1 font-display text-2xl text-white">{stats.uniqueSessions}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-white/[0.06] bg-black/30 p-4 sm:col-span-1">
          <p className="text-xs uppercase tracking-widest text-luxury-silver">Популярные</p>
          <ul className="mt-2 space-y-1 text-xs text-luxury-glow">
            {stats.byDevice.slice(0, 3).map((d) => (
              <li key={d.name}>
                {d.name} — {d.count}
              </li>
            ))}
            {stats.byDevice.length === 0 && (
              <li className="text-luxury-silver">Пока нет данных</li>
            )}
          </ul>
        </div>
      </div>

      {visits.length === 0 ? (
        <p className="mt-8 text-center text-sm text-luxury-silver">
          Пока никто не заходил — откройте сайт с другого устройства для проверки.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-widest text-luxury-silver">
                <th className="pb-3 pr-4">Когда</th>
                <th className="pb-3 pr-4">Устройство</th>
                <th className="pb-3 pr-4">Система</th>
                <th className="pb-3 pr-4">Браузер</th>
                <th className="pb-3 pr-4">Страница</th>
                <th className="pb-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v, i) => (
                <motion.tr
                  key={v.id}
                  className="border-b border-white/[0.04] text-luxury-silver"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <td className="py-3 pr-4 whitespace-nowrap text-white/90">
                    {formatDate(v.at)}
                  </td>
                  <td className="py-3 pr-4 text-white">
                    {deviceIcon(v.device.type)} {v.device.type}
                    {v.screen.width && (
                      <span className="ml-1 text-xs text-luxury-silver">
                        {v.screen.width}×{v.screen.height}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4">{v.device.os}</td>
                  <td className="py-3 pr-4">{v.device.browser}</td>
                  <td className="py-3 pr-4">{v.path}</td>
                  <td className="py-3 font-mono text-xs">{v.ip}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
