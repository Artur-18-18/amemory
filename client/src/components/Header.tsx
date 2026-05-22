import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Главная" },
  { to: "/gallery", label: "Галерея" },
  { to: "/music", label: "Музыка" },
  { to: "/playlist", label: "Плейлист" },
  { to: "/memories", label: "Воспоминания" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.04] bg-luxury-matte/90 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
        <Link
          to="/"
          className="shrink-0 font-display text-lg font-medium tracking-wide text-white transition hover:text-luxury-glow sm:text-xl"
          onClick={() => setOpen(false)}
        >
          Amemory
        </Link>

        <nav className="hidden items-center gap-4 xl:gap-6 lg:flex" aria-label="Основное меню">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "text-[10px] uppercase tracking-[0.12em] transition xl:text-xs xl:tracking-[0.15em]",
                  isActive ? "text-luxury-glow" : "text-luxury-silver hover:text-white",
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/admin"
            className="text-[10px] uppercase tracking-[0.12em] text-luxury-silver/60 hover:text-white xl:text-xs"
          >
            Админ
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/gallery"
            className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-widest text-white sm:px-4 sm:text-xs"
            onClick={() => setOpen(false)}
          >
            Смотреть
          </Link>
          <button
            type="button"
            className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-widest"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Меню"
          >
            {open ? "✕" : "Меню"}
          </button>
        </div>

        <Link
          to="/gallery"
          className="hidden rounded-full border border-white/10 px-5 py-1.5 text-xs uppercase tracking-widest text-white transition hover:border-luxury-glow/40 hover:shadow-glow lg:inline-flex"
        >
          Смотреть
        </Link>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="border-t border-white/[0.04] bg-luxury-matte/98 px-4 py-4 lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            aria-label="Мобильное меню"
          >
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2.5 text-sm uppercase tracking-widest text-luxury-silver active:text-white"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin"
              className="block py-2.5 text-sm uppercase tracking-widest text-luxury-silver/70"
              onClick={() => setOpen(false)}
            >
              Админ
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
