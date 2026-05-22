import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function About() {
  return (
    <section id="about" className="border-t border-white/[0.04] py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-luxury-glow/80">О проекте</p>
          <h2 className="font-display text-3xl font-light sm:text-4xl">Memories</h2>
          <p className="mt-6 text-sm leading-relaxed text-luxury-silver sm:text-base">
            Личный luxury-блог: витрина, галерея, музыка, плейлист и закрытые воспоминания.
            Весь контент управляется через{" "}
            <Link to="/admin" className="text-luxury-glow hover:underline">
              админ-панель
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/music"
              className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-widest transition hover:border-luxury-glow/40"
            >
              Музыка
            </Link>
            <Link
              to="/playlist"
              className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-widest transition hover:border-luxury-glow/40"
            >
              Плейлист
            </Link>
            <Link
              to="/memories"
              className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-widest transition hover:border-luxury-glow/40"
            >
              Воспоминания
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
